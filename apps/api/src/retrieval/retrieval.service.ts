import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMBEDDING_PROVIDER } from '../ai/ai.tokens';
import { EmbeddingProvider } from '../ai/ai.types';
import { VECTOR_STORE } from './vector.tokens';
import { VectorFilter, VectorHit, VectorStore } from './vector-store';

@Injectable()
export class RetrievalService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private readonly embeddings: EmbeddingProvider,
    @Inject(VECTOR_STORE) private readonly vectors: VectorStore,
    private readonly config: ConfigService,
  ) {}

  async search(query: string, filter: VectorFilter): Promise<VectorHit[]> {
    const [vector] = await this.embeddings.embed([query]);
    const limit = Number(this.config.get('TOP_K') ?? 5);
    const threshold = Number(this.config.get('SIMILARITY_THRESHOLD') ?? 0.25);
    return this.vectors.search(vector, filter, limit, threshold);
  }
}
