"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/status";
import { DocumentRecord, TraceRecord } from "@/lib/types";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [traces, setTraces] = useState<TraceRecord[]>([]);

  useEffect(() => {
    api<DocumentRecord[]>("/documents").then(setDocuments).catch(() => setDocuments([]));
    api<TraceRecord[]>("/traces").then(setTraces).catch(() => setTraces([]));
  }, []);

  const ready = documents.filter((document) => document.status === "PROCESSED").length;
  const latest = traces.slice(0, 8);

  return (
    <>
      <h1 className="text-4xl">Panel</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Documentos" value={documents.length} />
        <Stat label="Listos para preguntar" value={ready} />
        <Stat label="Preguntas" value={traces.length} />
      </div>
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Últimas preguntas</h2>
          <Link className="btn btn-secondary" href="/documents">
            Subir PDF
          </Link>
        </div>
        <ul className="panel mt-4 divide-y divide-[var(--line)]">
          {latest.length === 0 ? <li className="p-4 text-[var(--muted)]">Todavía no hay preguntas.</li> : null}
          {latest.map((trace) => (
            <li key={trace.id} className="p-4 text-sm">
              <p>{trace.question}</p>
              <p className="mt-1 text-[var(--muted)]">
                {trace.model} · búsqueda {formatDuration(trace.embeddingMs)} · {countLabel(trace.retrievedChunks, "fragmento", "fragmentos")} · respuesta {formatDuration(trace.llmMs)} · total {formatDuration(trace.totalMs)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="panel p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="text-3xl">{value}</p>
    </article>
  );
}
