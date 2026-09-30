import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { textArg } from './agent.tools';

export interface AgentRunContext {
  embeddingMs: number;
  retrievalMs: number;
  evidence: string[];
}

@Injectable()
export class AgentToolkit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieval: RetrievalService,
  ) {}

  async run(
    userId: string,
    name: string,
    args: Record<string, unknown>,
    documentIds: string[] | undefined,
    context: AgentRunContext,
  ) {
    if (name === 'search_documents') return this.searchDocuments(userId, args);
    if (name === 'search_chunks')
      return this.searchChunks(userId, args, documentIds, context);
    if (name === 'get_document')
      return this.getDocument(userId, args, documentIds);
    if (name === 'get_page')
      return this.getPage(userId, args, documentIds, context);
    if (name === 'generate_report') return this.report(args, context);
    return 'Herramienta desconocida';
  }

  private async searchDocuments(userId: string, args: Record<string, unknown>) {
    const documents = await this.prisma.document.findMany({
      where: {
        userId,
        filename: { contains: textArg(args.query), mode: 'insensitive' },
      },
      take: 10,
    });
    return JSON.stringify(
      documents.map((document) => ({
        id: document.id,
        filename: document.filename,
        status: document.status,
      })),
    );
  }

  private async searchChunks(
    userId: string,
    args: Record<string, unknown>,
    documentIds: string[] | undefined,
    context: AgentRunContext,
  ) {
    const documentId =
      typeof args.documentId === 'string' ? args.documentId : undefined;
    if (documentId && documentIds && !documentIds.includes(documentId)) {
      return 'Documento fuera del contexto autorizado.';
    }
    const searched = await this.retrieval.search(textArg(args.query), {
      userId,
      documentId,
      documentIds: documentId ? undefined : documentIds,
    });
    context.embeddingMs += searched.embeddingMs;
    context.retrievalMs += searched.retrievalMs;
    const output = JSON.stringify(searched.hits);
    context.evidence.push(output);
    return output;
  }

  private async getDocument(
    userId: string,
    args: Record<string, unknown>,
    documentIds: string[] | undefined,
  ) {
    if (outsideContext(documentIds, args)) {
      return 'Documento fuera del contexto autorizado.';
    }
    const document = await this.prisma.document.findFirst({
      where: { id: textArg(args.documentId), userId },
    });
    if (!document) return 'Documento no encontrado';
    return JSON.stringify({
      id: document.id,
      filename: document.filename,
      status: document.status,
    });
  }

  private async getPage(
    userId: string,
    args: Record<string, unknown>,
    documentIds: string[] | undefined,
    context: AgentRunContext,
  ) {
    if (outsideContext(documentIds, args)) {
      return 'Documento fuera del contexto autorizado.';
    }
    const document = await this.prisma.document.findFirst({
      where: { id: textArg(args.documentId), userId },
    });
    if (!document) return 'Documento no encontrado';
    const page = await this.prisma.documentPage.findFirst({
      where: { documentId: document.id, page: Number(args.page) },
    });
    const text = page?.text ?? 'Página sin texto';
    context.evidence.push(text);
    return text;
  }

  private report(args: Record<string, unknown>, context: AgentRunContext) {
    return [
      `# ${textArg(args.title, 'Informe')}`,
      '',
      'Evidencia recuperada con herramientas:',
      context.evidence.join('\n\n') || 'No se recuperó evidencia.',
      '',
      'Texto propuesto por el modelo. No es una fuente:',
      textArg(args.findings),
    ].join('\n');
  }
}

function outsideContext(
  documentIds: string[] | undefined,
  args: Record<string, unknown>,
) {
  const documentId = textArg(args.documentId);
  return Boolean(documentIds?.length && !documentIds.includes(documentId));
}
