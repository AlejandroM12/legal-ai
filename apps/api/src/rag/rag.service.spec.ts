import { describe, expect, it } from '@jest/globals';
import failures from '../../eval/failures.json';
import { asksForOverview } from './grounding';
import { buildGroundedPrompt } from './prompt';
import { selectOwnedHits } from './rag.service';

describe('owned retrieval', () => {
  it('drops hits whose document is gone', () => {
    const kept = selectOwnedHits(
      [
        { documentId: 'kept', page: 2 },
        { documentId: 'orphan', page: 9 },
      ],
      new Set(['kept']),
    );
    expect(kept.map((hit) => hit.documentId)).toEqual(['kept']);
  });

  it('publishes the case where the first pages answer the wrong question', () => {
    expect(failures).toHaveLength(3);
    const wrongPage = failures.find((item) => item.id === 'wrong-page-fallback');
    expect(wrongPage).toBeDefined();
    expect(asksForOverview(wrongPage?.question ?? '')).toBe(false);
    const prompt = buildGroundedPrompt(wrongPage?.question ?? '', [
      {
        filename: 'contrato.pdf',
        page: wrongPage?.page ?? 0,
        text: wrongPage?.text ?? '',
      },
    ]);
    const evidence = prompt.user.split('Contextos:\n')[1] ?? '';
    expect(evidence).toContain('page=1');
    expect(evidence).toContain('Acme SA');
    expect(evidence).not.toContain('rescisión');
  });
});
