export function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export function embedText(text: string, dimensions: number): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const tokens = normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
  for (const token of tokens) {
    let hash = 0;
    for (const char of token) {
      hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
    }
    vector[hash % dimensions] += 1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) return vector;
  return vector.map((value) => value / norm);
}
