import { ConfigService } from '@nestjs/config';
import { MockAiProvider } from '../ai/mock-ai.provider';
import { MemoryVectorStore } from './memory-vector.store';

describe('semantic search isolation', () => {
  it('returns a related chunk only for the owner', async () => {
    const config = new ConfigService({
      EMBEDDING_DIMENSIONS: '32',
      CHAT_MODEL: 'mock',
    });
    const ai = new MockAiProvider(config);
    const store = new MemoryVectorStore();
    await store.ensureCollection(ai.dimensions);
    const [contract, other] = await ai.embed([
      'El presente contrato tendrá una duración de veinticuatro meses',
      'La factura vence el viernes',
    ]);
    await store.upsert([
      {
        id: 'c1',
        vector: contract,
        payload: {
          user_id: 'user-a',
          document_id: 'doc-a',
          page: 12,
          chunk_id: 'c1',
          text: 'duración de veinticuatro meses',
        },
      },
      {
        id: 'c2',
        vector: other,
        payload: {
          user_id: 'user-b',
          document_id: 'doc-b',
          page: 1,
          chunk_id: 'c2',
          text: 'factura vence',
        },
      },
    ]);
    const [query] = await ai.embed(['duración del contrato']);
    const hits = await store.search(query, { userId: 'user-a' }, 5, 0.2);
    expect(hits.map((hit) => hit.documentId)).toEqual(['doc-a']);
    const foreign = await store.search(
      query,
      { userId: 'user-b', documentId: 'doc-a' },
      5,
      0,
    );
    expect(foreign).toEqual([]);
  });
});
