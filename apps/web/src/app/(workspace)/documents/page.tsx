"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { useDocuments } from "@/hooks/use-documents";
import { api } from "@/lib/api";
import { formatBytes } from "@/lib/status";
import { SearchHit } from "@/lib/types";

export default function DocumentsPage() {
  const { documents, error, setError, reload } = useDocuments();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    try {
      await api("/documents", { method: "POST", body: new FormData(formElement) });
      formElement.reset();
      await reload();
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      setHits(await api<SearchHit[]>("/search", {
        method: "POST",
        body: JSON.stringify({ query }),
      }));
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  return (
    <>
      <h1 className="text-4xl">Documentos</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        Subí un PDF. Cuando diga Listo, abrilo y hacé una pregunta. La respuesta cita la página del archivo.
      </p>
      <form onSubmit={onUpload} className="panel mt-6 flex flex-wrap items-end gap-3 p-4">
        <label className="text-sm">
          PDF
          <input name="file" type="file" accept="application/pdf,.pdf" required className="mt-1 block" />
        </label>
        <button className="btn btn-primary" type="submit">
          Subir
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-[var(--accent)]">{error}</p> : null}
      <ul className="panel mt-6 divide-y divide-[var(--line)]">
        {documents.length === 0 ? <li className="p-4 text-[var(--muted)]">No hay documentos.</li> : null}
        {documents.map((document) => (
          <li key={document.id}>
            <Link href={`/documents/${document.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-[var(--paper)]">
              <span className="min-w-0">
                <span className="block truncate">{document.filename}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={document.status} />
                  {document.errorMessage ? <span className="text-sm text-[var(--muted)]">{document.errorMessage}</span> : null}
                </span>
              </span>
              <span className="shrink-0 text-sm text-[var(--muted)]">{formatBytes(document.size)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <form onSubmit={onSearch} className="mt-8">
        <h2 className="text-2xl">Buscar en tus documentos</h2>
        <div className="mt-3 flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Por ejemplo: vencimiento"
            className="field mt-0"
          />
          <button className="btn btn-secondary" type="submit">
            Buscar
          </button>
        </div>
      </form>
      <ul className="mt-4 space-y-3">
        {hits.map((hit) => (
          <li key={hit.chunkId} className="panel p-4 text-sm">
            <p className="text-[var(--muted)]">
              {hit.filename} · página {hit.page}
            </p>
            <p className="mt-2">{hit.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
