import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PdfUpload, validatePdfUpload } from './validate-upload';
import { IngestionService } from '../ingestion/ingestion.service';
import { VECTOR_STORE } from '../retrieval/vector.tokens';
import { VectorStore } from '../retrieval/vector-store';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
    private readonly ingestion: IngestionService,
    @Inject(VECTOR_STORE) private readonly vectors: VectorStore,
  ) {}

  async create(userId: string, file: PdfUpload) {
    const maxBytes = Number(
      this.config.get('MAX_UPLOAD_BYTES') ?? 20 * 1024 * 1024,
    );
    const filename = validatePdfUpload(file, maxBytes);
    const document = await this.prisma.document.create({
      data: {
        userId,
        filename,
        status: 'UPLOADED',
        mimeType: 'application/pdf',
        size: file.size,
        storagePath: 'pending',
      },
    });
    const directory = join(
      this.config.get<string>('STORAGE_DIR') ?? './storage',
      userId,
    );
    await mkdir(directory, { recursive: true });
    const storagePath = join(directory, `${document.id}.pdf`);
    await writeFile(storagePath, file.buffer);
    const saved = await this.prisma.document.update({
      where: { id: document.id },
      data: { storagePath },
    });
    await this.audit.log(userId, 'upload', 'document', document.id, {
      filename,
    });
    void this.ingestion.process(saved.id);
    return this.toRecord(saved);
  }

  async list(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return documents.map((document) => this.toRecord(document));
  }

  async get(userId: string, id: string) {
    const document = await this.requireOwned(userId, id);
    await this.audit.log(userId, 'read', 'document', id);
    return this.toRecord(document);
  }

  async pages(userId: string, id: string) {
    await this.requireOwned(userId, id);
    const pages = await this.prisma.documentPage.findMany({
      where: { documentId: id },
      orderBy: { page: 'asc' },
    });
    return pages.map((page) => ({ page: page.page, text: page.text }));
  }

  async chunks(userId: string, id: string) {
    await this.requireOwned(userId, id);
    const chunks = await this.prisma.chunk.findMany({
      where: { documentId: id, userId },
      orderBy: { chunkIndex: 'asc' },
    });
    return chunks.map((chunk) => ({
      id: chunk.id,
      documentId: chunk.documentId,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
    }));
  }

  async reprocess(userId: string, id: string) {
    const document = await this.requireOwned(userId, id);
    await this.prisma.document.update({
      where: { id },
      data: { status: 'PROCESSING', errorMessage: null },
    });
    void this.ingestion.process(id);
    return this.toRecord({
      ...document,
      status: 'PROCESSING',
      errorMessage: null,
    });
  }

  async remove(userId: string, id: string) {
    const document = await this.requireOwned(userId, id);
    await this.vectors.deleteByDocument(id, userId);
    await this.prisma.document.delete({ where: { id } });
    await unlink(document.storagePath).catch(() => undefined);
    await this.audit.log(userId, 'delete', 'document', id);
    return { ok: true };
  }

  async requireOwned(userId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });
    if (!document) throw new NotFoundException('Documento no encontrado');
    return document;
  }

  private toRecord(document: {
    id: string;
    userId: string;
    filename: string;
    status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
    mimeType: string;
    size: number;
    errorMessage: string | null;
    createdAt: Date;
  }) {
    return {
      id: document.id,
      userId: document.userId,
      filename: document.filename,
      status: document.status,
      mimeType: document.mimeType,
      size: document.size,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt.toISOString(),
    };
  }
}
