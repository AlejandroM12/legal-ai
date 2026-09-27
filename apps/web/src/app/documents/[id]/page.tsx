"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { AnalysisPanel } from "@/components/document/analysis-panel";
import { ChunkList } from "@/components/document/chunk-list";
import { QuestionPanel } from "@/components/document/question-panel";
import { Shell } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { useDocument } from "@/hooks/use-document";
import { api } from "@/lib/api";
import { AskResponse } from "@/lib/types";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const { document, chunks, error, setError, ready } = useDocument(params.id);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [agentMessage, setAgentMessage] = useState("");
  const [report, setReport] = useState("");
  const [asking, setAsking] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (question.trim().length < 2) {
      setError("Escribí una pregunta.");
      return;
    }
    setAsking(true);
    try {
      setAnswer(await api<AskResponse>(`/documents/${params.id}/ask`, {
        method: "POST",
        body: JSON.stringify({ question }),
      }));
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setAsking(false);
    }
  }

  async function onAnalyze(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (agentMessage.trim().length < 2) {
      setError("Escribí qué querés analizar.");
      return;
    }
    setAnalyzing(true);
    setReport("");
    try {
      const result = await api<{ answer: string }>("/agent/run", {
        method: "POST",
        body: JSON.stringify({ message: agentMessage, documentIds: [params.id] }),
      });
      setReport(result.answer || "El análisis no devolvió texto.");
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-4xl">{document?.filename ?? "Documento"}</h1>
      <p className="mt-2">
        {document ? <StatusBadge status={document.status} /> : null}
        {document?.errorMessage ? <span className="text-sm text-[var(--muted)]"> · {document.errorMessage}</span> : null}
      </p>
      {error ? <p className="mt-3 text-sm text-[var(--accent)]">{error}</p> : null}
      <QuestionPanel
        ready={ready}
        asking={asking}
        question={question}
        answer={answer}
        onQuestion={setQuestion}
        onAsk={onAsk}
      />
      <AnalysisPanel
        ready={ready}
        analyzing={analyzing}
        message={agentMessage}
        report={report}
        onMessage={setAgentMessage}
        onAnalyze={onAnalyze}
      />
      <ChunkList chunks={chunks} />
    </Shell>
  );
}
