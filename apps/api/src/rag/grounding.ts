export interface ParsedAnswer {
  answer: string;
  used: number[];
  abstained: boolean;
}

export interface EvidenceItem {
  documentId: string;
  filename: string;
  page: number;
  chunkId: string;
  text: string;
  score: number;
}

export function asksForOverview(question: string) {
  const normalized = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return /de que trata|resumen|de que se trata|que es este|sobre que es/.test(
    normalized,
  );
}

export function parseModelAnswer(raw: string): ParsedAnswer | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1)) as {
      answer?: unknown;
      used?: unknown;
      abstained?: unknown;
    };
    const used = Array.isArray(value.used)
      ? value.used.filter((item): item is number => Number.isInteger(item))
      : [];
    return {
      answer: typeof value.answer === 'string' ? value.answer.trim() : '',
      used,
      abstained: value.abstained === true,
    };
  } catch {
    return null;
  }
}

export function groundAnswer(raw: string, evidence: EvidenceItem[]) {
  const parsed = parseModelAnswer(raw);
  if (!parsed) {
    return {
      answer: 'No se pudo leer la respuesta del modelo.',
      citations: [] as EvidenceItem[],
      abstained: true,
      grounded: false,
    };
  }
  const selected = parsed.used
    .filter((index) => index >= 1 && index <= evidence.length)
    .map((index) => evidence[index - 1]);
  if (parsed.abstained || selected.length === 0) {
    return {
      answer: parsed.answer || 'El documento no lo indica.',
      citations: [] as EvidenceItem[],
      abstained: true,
      grounded: false,
    };
  }
  return {
    answer: parsed.answer,
    citations: selected,
    abstained: false,
    grounded: true,
  };
}

export function trustModelAnswer(raw: string, evidence: EvidenceItem[]) {
  const parsed = parseModelAnswer(raw);
  if (!parsed || parsed.abstained || parsed.used.length === 0) {
    return { citations: 0, invented: 0 };
  }
  const invented = parsed.used.filter(
    (index) => index < 1 || index > evidence.length,
  ).length;
  return { citations: parsed.used.length, invented };
}
