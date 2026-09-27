"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DocumentRecord } from "@/lib/types";

function isPending(status: string) {
  return status === "UPLOADED" || status === "PROCESSING";
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setDocuments(await api<DocumentRecord[]>("/documents"));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void reload().catch((caught) => setError((caught as Error).message));
  }, [reload]);

  const pending = documents.some((document) => isPending(document.status));

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => {
      reload().catch(() => undefined);
    }, 2000);
    return () => clearInterval(timer);
  }, [pending, reload]);

  return { documents, error, setError, reload };
}
