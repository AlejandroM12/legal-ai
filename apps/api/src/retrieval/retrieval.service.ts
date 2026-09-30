import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMBEDDING_PROVIDER } from '../ai/ai.tokens';
import { EmbeddingProvider } from '../ai/ai.types';
import { VECTOR_STORE } from './vector.tokens';
import { VectorFilter, VectorStore } from './vector-store';

@Injectable()
export class RetrievalService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private readonly embeddings: EmbeddingProvider,
    @Inject(VECTOR_STORE) private readonly vectors: VectorStore,
    private readonly config: ConfigService,
  ) {}

  async search(query: string, filter: VectorFilter) {
    const embedStarted = Date.now();
    const [vector] = await this.embeddings.embed([query]);
    const embeddingMs = Date.now() - embedStarted;
    const limit = Number(this.config.get('TOP_K') ?? 5);
    const threshold = Number(this.config.get('SIMILARITY_THRESHOLD') ?? 0.25);
    const searchStarted = Date.now();
    const hits = await this.vectors.search(vector, filter, limit, threshold);
    return { hits, embeddingMs, retrievalMs: Date.now() - searchStarted };
  }
}
