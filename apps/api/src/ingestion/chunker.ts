export interface PageText {
  page: number;
  text: string;
}

export interface ChunkDraft {
  page: number;
  chunkIndex: number;
  text: string;
}

export function chunkPages(
  pages: PageText[],
  size: number,
  overlap: number,
): ChunkDraft[] {
  const windowSize = Math.max(1, size);
  const overlapSize = Math.max(0, Math.min(overlap, windowSize - 1));
  const chunks: ChunkDraft[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const text = page.text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + windowSize, text.length);
      const slice = text.slice(start, end).trim();
      if (slice) {
        chunks.push({ page: page.page, chunkIndex, text: slice });
        chunkIndex += 1;
      }
      if (end >= text.length) break;
      const next = end - overlapSize;
      start = next > start ? next : start + 1;
    }
  }

  return chunks;
}
