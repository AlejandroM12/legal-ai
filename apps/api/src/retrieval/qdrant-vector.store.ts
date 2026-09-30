import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import {
  VectorFilter,
  VectorHit,
  VectorPoint,
  VectorStore,
} from './vector-store';

@Injectable()
export class QdrantVectorStore implements VectorStore {
  private readonly client: QdrantClient;
  private readonly collection: string;
  private ready = false;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('QDRANT_API_KEY');
    this.client = new QdrantClient({
      url: config.get<string>('QDRANT_URL') ?? 'http://localhost:6333',
      ...(apiKey ? { apiKey } : {}),
    });
    this.collection = config.get<string>('QDRANT_COLLECTION') ?? 'legal_chunks';
  }

  async ensureCollection(dimensions: number) {
    if (this.ready) return;
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(
      (collection) => collection.name === this.collection,
    );
    if (!exists) {
      await this.client.createCollection(this.collection, {
        vectors: { size: dimensions, distance: 'Cosine' },
      });
    }
    this.ready = true;
  }

  async upsert(points: VectorPoint[]) {
    if (points.length === 0) return;
    await this.client.upsert(this.collection, {
      wait: true,
      points: points.map((point) => ({
        id: point.id,
        vector: point.vector,
        payload: point.payload,
      })),
    });
  }

  async search(
    vector: number[],
    filter: VectorFilter,
    limit: number,
    threshold: number,
  ): Promise<VectorHit[]> {
    const must: Array<Record<string, unknown>> = [
      { key: 'user_id', match: { value: filter.userId } },
    ];
    if (filter.documentId) {
      must.push({ key: 'document_id', match: { value: filter.documentId } });
    }
    if (filter.documentIds?.length) {
      must.push({ key: 'document_id', match: { any: filter.documentIds } });
    }
    const results = await this.client.query(this.collection, {
      query: vector,
      limit,
      score_threshold: threshold,
      filter: { must },
      with_payload: true,
    });
    return results.points.map((hit) => {
      const payload = (hit.payload ?? {}) as VectorPoint['payload'];
      return {
        chunkId: payload.chunk_id,
        documentId: payload.document_id,
        page: payload.page,
        text: payload.text,
        score: hit.score,
      };
    });
  }

  async deleteByDocument(documentId: string, userId: string) {
    try {
      await this.client.delete(this.collection, {
        wait: true,
        filter: {
          must: [
            { key: 'document_id', match: { value: documentId } },
            { key: 'user_id', match: { value: userId } },
          ],
        },
      });
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404) return;
      throw error;
    }
  }
}
