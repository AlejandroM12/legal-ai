import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { parsePdf } from './parser';
import { chunkPages } from './chunker';
import { EMBEDDING_PROVIDER } from '../ai/ai.tokens';
import { EmbeddingProvider } from '../ai/ai.types';
import { VECTOR_STORE } from '../retrieval/vector.tokens';
import { VectorStore } from '../retrieval/vector-store';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(EMBEDDING_PROVIDER) private readonly embeddings: EmbeddingProvider,
    @Inject(VECTOR_STORE) private readonly vectors: VectorStore,
  ) {}

  async process(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) return;
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING', errorMessage: null },
    });
    try {
      const buffer = await readFile(document.storagePath);
      const pages = await parsePdf(buffer);
      const chunks = chunkPages(
        pages,
        Number(this.config.get('CHUNK_SIZE') ?? 1200),
        Number(this.config.get('CHUNK_OVERLAP') ?? 150),
      );
      await this.prisma.documentPage.deleteMany({ where: { documentId } });
      await this.prisma.chunk.deleteMany({ where: { documentId } });
      if (pages.length) {
        await this.prisma.documentPage.createMany({
          data: pages.map((page) => ({
            documentId,
            page: page.page,
            text: page.text,
          })),
        });
      }
      const created = [];
      for (const chunk of chunks) {
        created.push(
          await this.prisma.chunk.create({
            data: {
              documentId,
              userId: document.userId,
              page: chunk.page,
              chunkIndex: chunk.chunkIndex,
              text: chunk.text,
            },
          }),
        );
      }
      if (!created.length) {
        throw new Error(
          'El PDF no tiene texto legible. Si es una foto, el reconocimiento tampoco encontró letras.',
        );
      }
      await this.vectors.ensureCollection(this.embeddings.dimensions);
      const vectors = await this.embeddings.embed(
        created.map((chunk) => chunk.text),
      );
      await this.vectors.upsert(
        created.map((chunk, index) => ({
          id: chunk.id,
          vector: vectors[index],
          payload: {
            user_id: document.userId,
            document_id: documentId,
            page: chunk.page,
            chunk_id: chunk.id,
            text: chunk.text,
          },
        })),
      );
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSED' },
      });
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(`Ingesta fallida ${documentId}: ${message}`);
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED', errorMessage: message },
      });
    }
  }
}
