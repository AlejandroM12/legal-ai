import { FormEvent } from "react";
import { AskResponse } from "@/lib/types";

interface QuestionPanelProps {
  ready: boolean;
  asking: boolean;
  question: string;
  answer: AskResponse | null;
  onQuestion: (value: string) => void;
  onAsk: (event: FormEvent) => void;
}

export function QuestionPanel({ ready, asking, question, answer, onQuestion, onAsk }: QuestionPanelProps) {
  return (
    <form onSubmit={onAsk} className="panel mt-6 space-y-3 p-4">
      <h2 className="text-2xl">Pregunta</h2>
      <p className="text-sm text-[var(--muted)]">
        {ready ? "Una pregunta concreta. La respuesta incluye la página." : "Esperá a que el documento esté listo."}
      </p>
      <input
        value={question}
        onChange={(event) => onQuestion(event.target.value)}
        placeholder="¿De qué mes es este resumen?"
        disabled={!ready || asking}
        className="field"
      />
      <button className="btn btn-primary" type="submit" disabled={!ready || asking}>
        {asking ? "Buscando respuesta…" : "Preguntar"}
      </button>
      {answer ? (
        <div className="border-t border-[var(--line)] pt-3 text-sm">
          <p>{answer.answer}</p>
          <ul className="mt-3 space-y-2 text-[var(--muted)]">
            {answer.citations.map((citation) => (
              <li key={citation.chunkId}>
                Fuente: {citation.filename} · página {citation.page}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
