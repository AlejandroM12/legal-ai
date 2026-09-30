import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHAT_PROVIDER } from '../ai/ai.tokens';
import { ChatProvider } from '../ai/ai.types';
import { RetrievalService } from '../retrieval/retrieval.service';
import { VectorHit } from '../retrieval/vector-store';
import { TraceService } from '../observability/trace.service';
import { asksForOverview, groundAnswer } from './grounding';
import { buildGroundedPrompt } from './prompt';

const NO_TEXT =
  'Este PDF no tiene texto para leer. Si es una foto o un escaneo, volvé a subirlo.';
const NO_HITS = 'No encontré evidencia suficiente en el documento.';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieval: RetrievalService,
    private readonly traces: TraceService,
    @Inject(CHAT_PROVIDER) private readonly chat: ChatProvider,
  ) {}

  async ask(userId: string, question: string, documentId?: string) {
    const started = Date.now();
    if (documentId) {
      const owned = await this.prisma.document.findFirst({
        where: { id: documentId, userId },
      });
      if (!owned) throw new NotFoundException('Documento no encontrado');
    }

    const searched = await this.retrieval.search(question, {
      userId,
      documentId,
    });
    let hits = searched.hits;
    let retrievalMs = searched.retrievalMs;
    const embeddingMs = searched.embeddingMs;
    if (documentId && hits.length === 0 && asksForOverview(question)) {
      const fallbackStarted = Date.now();
      hits = await this.openingChunks(userId, documentId);
      retrievalMs += Date.now() - fallbackStarted;
    }
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        id: { in: [...new Set(hits.map((hit) => hit.documentId))] },
      },
    });
    const ownedIds = new Set(documents.map((document) => document.id));
    const kept = selectOwnedHits(hits, ownedIds);
    if (kept.length !== hits.length) {
      this.logger.warn(
        `Se descartaron ${hits.length - kept.length} hits sin documento propio`,
      );
    }
    const filenames = new Map(
      documents.map((document) => [document.id, document.filename]),
    );
    if (kept.length === 0) {
      const answer =
        documentId && asksForOverview(question) ? NO_TEXT : NO_HITS;
      const trace = await this.traces.record({
        userId,
        question,
        model: this.chat.model,
        embeddingMs,
        retrievalMs,
        llmMs: 0,
        totalMs: Date.now() - started,
        retrievedChunks: 0,
        promptTokens: null,
        completionTokens: null,
        error: null,
        tools: null,
      });
      return { answer, citations: [], traceId: trace.id, abstained: true };
    }
    const citations = kept.map((hit) => ({
      documentId: hit.documentId,
      filename: filenames.get(hit.documentId) ?? 'documento',
      page: hit.page,
      chunkId: hit.chunkId,
      text: hit.text,
      score: hit.score,
    }));

    const prompt = buildGroundedPrompt(
      question,
      citations.map((citation) => ({
        filename: citation.filename,
        page: citation.page,
        text: citation.text,
      })),
    );
    const llmStarted = Date.now();
    let grounded = {
      answer: 'No se pudo generar la respuesta.',
      citations: [] as typeof citations,
      abstained: true,
      grounded: false,
    };
    let error: string | null = null;
    let promptTokens: number | null = null;
    let completionTokens: number | null = null;
    try {
      const result = await this.chat.chat([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ]);
      grounded = groundAnswer(result.content, citations);
      promptTokens = result.promptTokens;
      completionTokens = result.completionTokens;
    } catch (caught) {
      error = (caught as Error).message;
    }
    const llmMs = Date.now() - llmStarted;
    const trace = await this.traces.record({
      userId,
      question,
      model: this.chat.model,
      embeddingMs,
      retrievalMs,
      llmMs,
      totalMs: Date.now() - started,
      retrievedChunks: citations.length,
      promptTokens,
      completionTokens,
      error,
      tools: null,
    });

    return {
      answer: grounded.answer,
      citations: grounded.citations,
      traceId: trace.id,
      abstained: grounded.abstained,
      grounded: grounded.grounded,
    };
  }

  private async openingChunks(
    userId: string,
    documentId: string,
  ): Promise<VectorHit[]> {
    const chunks = await this.prisma.chunk.findMany({
      where: { documentId, userId },
      orderBy: [{ page: 'asc' }, { chunkIndex: 'asc' }],
      take: 4,
    });
    return chunks.map((chunk) => ({
      chunkId: chunk.id,
      documentId: chunk.documentId,
      page: chunk.page,
      text: chunk.text,
      score: 0,
    }));
  }
}

export function selectOwnedHits<T extends { documentId: string }>(
  hits: T[],
  ownedIds: Set<string>,
) {
  return hits.filter((hit) => ownedIds.has(hit.documentId));
}
