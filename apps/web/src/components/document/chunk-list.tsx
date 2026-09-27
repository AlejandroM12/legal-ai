import { ChunkRecord } from "@/lib/types";

export function ChunkList({ chunks }: { chunks: ChunkRecord[] }) {
  return (
    <details className="mt-6">
      <summary className="cursor-pointer text-lg">Fragmentos ({chunks.length})</summary>
      <ul className="mt-3 space-y-3">
        {chunks.map((chunk) => (
          <li key={chunk.id} className="panel p-4 text-sm">
            <p className="text-[var(--muted)]">
              #{chunk.chunkIndex} · página {chunk.page}
            </p>
            <p className="mt-2">{chunk.text}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
