import dataset from '../../eval/dataset.json';
import { embedText } from '../ai/hash-embedding';
import { MemoryVectorStore } from '../retrieval/memory-vector.store';

const corpus = [
  { page: 1, text: 'Las partes son Acme SA y Norte SRL.' },
  {
    page: 12,
    text: 'El presente contrato tendrá una duración de veinticuatro meses, es decir 24 meses.',
  },
];

describe('rag evaluation dataset', () => {
  it('recovers expected pages for each question', async () => {
    const store = new MemoryVectorStore();
    await store.ensureCollection(64);
    await store.upsert(
      corpus.map((item, index) => ({
        id: `chunk-${index}`,
        vector: embedText(item.text, 64),
        payload: {
          user_id: 'eval-user',
          document_id: 'eval-doc',
          page: item.page,
          chunk_id: `chunk-${index}`,
          text: item.text,
        },
      })),
    );

    for (const example of dataset) {
      const hits = await store.search(
        embedText(example.question, 64),
        { userId: 'eval-user' },
        3,
        0.1,
      );
      const pages = hits.map((hit) => hit.page);
      expect(pages).toEqual(
        expect.arrayContaining(
          example.expected_sources.map((source) => source.page),
        ),
      );
      const evidence = hits.map((hit) => hit.text).join(' ');
      const expectedNumber = example.expected_answer.match(/\d+/)?.[0];
      if (expectedNumber) {
        expect(evidence.toLowerCase()).toContain(expectedNumber);
      } else {
        expect(evidence.toLowerCase()).toContain(
          example.expected_answer.toLowerCase().split(' ')[0],
        );
      }
    }
  });
});
