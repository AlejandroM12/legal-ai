"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChunkRecord, DocumentRecord } from "@/lib/types";

function isPending(status: string) {
  return status === "UPLOADED" || status === "PROCESSING";
}

export function useDocument(id: string) {
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [chunks, setChunks] = useState<ChunkRecord[]>([]);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    const [nextDocument, nextChunks] = await Promise.all([
      api<DocumentRecord>(`/documents/${id}`),
      api<ChunkRecord[]>(`/documents/${id}/chunks`),
    ]);
    setDocument(nextDocument);
    setChunks(nextChunks);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the id changes
    void reload().catch((caught) => setError((caught as Error).message));
  }, [reload]);

  const pending = document ? isPending(document.status) : false;

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      reload().catch(() => undefined);
    }, 2000);
    return () => clearInterval(timer);
  }, [pending, reload]);

  return {
    document,
    chunks,
    error,
    setError,
    ready: document?.status === "PROCESSED",
  };
}
