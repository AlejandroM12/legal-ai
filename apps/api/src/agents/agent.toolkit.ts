import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { textArg } from './agent.tools';

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
    documentIds?: string[],
  ) {
    if (name === 'search_documents') return this.searchDocuments(userId, args);
    if (name === 'search_chunks')
      return this.searchChunks(userId, args, documentIds);
    if (name === 'get_document') return this.getDocument(userId, args);
    if (name === 'get_page') return this.getPage(userId, args);
    if (name === 'generate_report') return this.report(args);
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
    documentIds?: string[],
  ) {
    const documentId =
      typeof args.documentId === 'string' ? args.documentId : undefined;
    if (documentId && documentIds && !documentIds.includes(documentId)) {
      return 'Documento fuera del contexto autorizado.';
    }
    const hits = await this.retrieval.search(textArg(args.query), {
      userId,
      documentId,
      documentIds: documentId ? undefined : documentIds,
    });
    return JSON.stringify(hits);
  }

  private async getDocument(userId: string, args: Record<string, unknown>) {
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

  private async getPage(userId: string, args: Record<string, unknown>) {
    const document = await this.prisma.document.findFirst({
      where: { id: textArg(args.documentId), userId },
    });
    if (!document) return 'Documento no encontrado';
    const page = await this.prisma.documentPage.findFirst({
      where: { documentId: document.id, page: Number(args.page) },
    });
    return page?.text ?? 'Página sin texto';
  }

  private report(args: Record<string, unknown>) {
    return [
      `# ${textArg(args.title, 'Informe')}`,
      '',
      textArg(args.findings),
    ].join('\n');
  }
}
