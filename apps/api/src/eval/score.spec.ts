import { describe, expect, it } from '@jest/globals';
import { embedText } from '../ai/hash-embedding';
import { MemoryVectorStore } from '../retrieval/memory-vector.store';

const facts = [
  ['duracion veinticuatro meses contrato acme', 12],
  ['rescision anticipada clausula duodecima', 4],
  ['penalidad mora intereses pactados', 8],
  ['foro tribunales ciudad buenos aires', 2],
  ['confidencialidad cinco anios vigencia', 6],
  ['precio mensual pesos actualizable', 3],
  ['plazo entrega quince dias habiles', 9],
  ['garantia vicios ocultos noventa dias', 11],
  ['cesion prohibida sin consentimiento escrito', 5],
  ['domicilio constituido avenida corrientes', 1],
  ['mora automatica sin interpelacion', 7],
  ['seguro responsabilidad civil contratista', 10],
  ['anexo tecnico prevalece sobre condiciones', 13],
  ['impuestos a cargo del comprador', 14],
  ['resolucion por incumplimiento grave', 15],
  ['notificaciones por correo electronico fehaciente', 16],
] as const;

const factual = facts.flatMap(([text, page]) => {
  const tokens = text.split(' ');
  return [
    { question: tokens.slice(0, 3).join(' '), page, abstain: false },
    { question: tokens.slice(-3).join(' '), page, abstain: false },
  ];
});

const absent = Array.from({ length: 18 }, (_, index) => ({
  question: `zxqv hipoteca naval antartida caso${index}`,
  page: 0,
  abstain: true,
}));

const questions = [...factual, ...absent];

describe('retrieval score', () => {
  it('keeps recall and abstention above the published bar', async () => {
    expect(questions).toHaveLength(50);
    const store = new MemoryVectorStore();
    await store.ensureCollection(256);
    await store.upsert(
      facts.map(([text, page], index) => ({
        id: `fact-${index}`,
        vector: embedText(text, 256),
        payload: {
          user_id: 'eval-user',
          document_id: 'eval-doc',
          page,
          chunk_id: `fact-${index}`,
          text,
        },
      })),
    );

    let retrieved = 0;
    let abstained = 0;
    let factualCount = 0;
    let absentCount = 0;
    for (const item of questions) {
      const hits = await store.search(
        embedText(item.question, 256),
        { userId: 'eval-user' },
        3,
        0.4,
      );
      if (item.abstain) {
        absentCount += 1;
        if (hits.length === 0) abstained += 1;
      } else {
        factualCount += 1;
        if (hits.some((hit) => hit.page === item.page)) retrieved += 1;
      }
    }

    const recall = retrieved / factualCount;
    const abstention = abstained / absentCount;
    expect(recall).toBeGreaterThanOrEqual(0.9);
    expect(abstention).toBe(1);
  });
});
