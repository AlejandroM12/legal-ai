import { chunkPages } from './chunker';

describe('chunkPages', () => {
  it('splits long pages and keeps page numbers with overlap', () => {
    const text = 'a'.repeat(50);
    const chunks = chunkPages([{ page: 3, text }], 20, 5);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.page === 3)).toBe(true);
    expect(chunks[0].text.length).toBeLessThanOrEqual(20);
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual(
      chunks.map((_, index) => index),
    );
  });

  it('skips empty pages', () => {
    expect(
      chunkPages(
        [
          { page: 1, text: '   ' },
          { page: 2, text: 'clausula' },
        ],
        100,
        10,
      ),
    ).toEqual([{ page: 2, chunkIndex: 0, text: 'clausula' }]);
  });
});
