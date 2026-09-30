import { describe, expect, it } from '@jest/globals';
import {
  asksForOverview,
  groundAnswer,
  trustModelAnswer,
  type EvidenceItem,
} from './grounding';

const evidence: EvidenceItem[] = [
  {
    documentId: 'doc',
    filename: 'contrato.pdf',
    page: 12,
    chunkId: 'a',
    text: 'dura 24 meses',
    score: 0.8,
  },
  {
    documentId: 'doc',
    filename: 'contrato.pdf',
    page: 12,
    chunkId: 'b',
    text: 'la rescision esta en la clausula duodecima',
    score: 0.7,
  },
];

describe('groundAnswer', () => {
  it('keeps only blocks that were retrieved', () => {
    const grounded = groundAnswer(
      '{"answer":"Dura 24 meses.","used":[1,9],"abstained":false}',
      evidence,
    );
    expect(grounded.grounded).toBe(true);
    expect(grounded.citations.map((item) => item.chunkId)).toEqual(['a']);
  });

  it('abstains when the model cites a block that does not exist', () => {
    const grounded = groundAnswer(
      '{"answer":"Figura en la pagina 99.","used":[9],"abstained":false}',
      evidence,
    );
    expect(grounded.abstained).toBe(true);
    expect(grounded.citations).toEqual([]);
  });

  it('scores lower when citations are trusted without validation', () => {
    const cases = [
      {
        raw: '{"answer":"Dura 24 meses.","used":[1],"abstained":false}',
        expectAbstain: false,
      },
      {
        raw: '{"answer":"Figura en la pagina 99.","used":[9],"abstained":false}',
        expectAbstain: true,
      },
    ];
    const strict =
      cases.filter((item) => groundAnswer(item.raw, evidence).abstained === item.expectAbstain)
        .length / cases.length;
    const weak =
      cases.filter((item) => {
        const trusted = trustModelAnswer(item.raw, evidence);
        const abstained = trusted.citations === 0;
        return abstained === item.expectAbstain;
      }).length / cases.length;
    expect(strict).toBe(1);
    expect(weak).toBe(0.5);
    expect(weak).toBeLessThan(strict);
  });

  it('uses the opening of the file only for an overview question', () => {
    expect(asksForOverview('¿De qué trata este pdf?')).toBe(true);
    expect(asksForOverview('¿Cuál es la cláusula de rescisión?')).toBe(false);
  });
});
