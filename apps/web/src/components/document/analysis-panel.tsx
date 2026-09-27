import { FormEvent } from "react";

interface AnalysisPanelProps {
  ready: boolean;
  analyzing: boolean;
  message: string;
  report: string;
  onMessage: (value: string) => void;
  onAnalyze: (event: FormEvent) => void;
}

export function AnalysisPanel({ ready, analyzing, message, report, onMessage, onAnalyze }: AnalysisPanelProps) {
  return (
    <details className="panel mt-6 p-4">
      <summary className="cursor-pointer text-lg">Análisis más amplio</summary>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Pedile que recorra el documento. Tarda más que una pregunta directa.
      </p>
      <form onSubmit={onAnalyze} className="mt-3 space-y-3">
        <textarea
          value={message}
          onChange={(event) => onMessage(event.target.value)}
          placeholder="Resumí los gastos principales"
          disabled={!ready || analyzing}
          className="field"
          rows={3}
        />
        <button className="btn btn-secondary" type="submit" disabled={!ready || analyzing}>
          {analyzing ? "Analizando…" : "Analizar"}
        </button>
        {report ? <p className="text-sm whitespace-pre-wrap">{report}</p> : null}
      </form>
    </details>
  );
}
