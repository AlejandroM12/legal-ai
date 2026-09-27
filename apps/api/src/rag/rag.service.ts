import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHAT_PROVIDER } from '../ai/ai.tokens';
import { ChatProvider } from '../ai/ai.types';
import { RetrievalService } from '../retrieval/retrieval.service';
import { TraceService } from '../observability/trace.service';
import { buildGroundedPrompt } from './prompt';

@Injectable()
export class RagService {
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

    const embeddingStarted = Date.now();
    const hits = await this.retrieval.search(question, { userId, documentId });
    const embeddingMs = Date.now() - embeddingStarted;
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        id: { in: [...new Set(hits.map((hit) => hit.documentId))] },
      },
    });
    const filenames = new Map(
      documents.map((document) => [document.id, document.filename]),
    );
    const citations = hits
      .filter((hit) => filenames.has(hit.documentId))
      .map((hit) => ({
        documentId: hit.documentId,
        filename: filenames.get(hit.documentId) ?? 'documento',
        page: hit.page,
        chunkId: hit.chunkId,
        text: hit.text,
        score: hit.score,
      }));

    if (citations.length !== hits.length) {
      throw new ForbiddenException('El retrieval incluyó documentos ajenos');
    }

    const prompt = buildGroundedPrompt(
      question,
      citations.map((citation) => ({
        filename: citation.filename,
        page: citation.page,
        text: citation.text,
      })),
    );
    const llmStarted = Date.now();
    let answer = 'El documento no lo indica.';
    let error: string | null = null;
    let promptTokens: number | null = null;
    let completionTokens: number | null = null;
    try {
      const result = await this.chat.chat([
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ]);
      answer = result.content.trim() || answer;
      promptTokens = result.promptTokens;
      completionTokens = result.completionTokens;
    } catch (caught) {
      error = (caught as Error).message;
      answer = 'No se pudo generar la respuesta.';
    }
    const llmMs = Date.now() - llmStarted;
    const trace = await this.traces.record({
      userId,
      question,
      model: this.chat.model,
      embeddingMs,
      retrievalMs: embeddingMs,
      llmMs,
      totalMs: Date.now() - started,
      retrievedChunks: citations.length,
      promptTokens,
      completionTokens,
      error,
    });

    return { answer, citations, traceId: trace.id };
  }
}
