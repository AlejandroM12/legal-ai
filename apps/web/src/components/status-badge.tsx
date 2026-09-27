import { statusLabel } from "@/lib/status";

const tone: Record<string, string> = {
  PROCESSED: "text-[var(--ink)]",
  FAILED: "text-[var(--accent)]",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`text-sm ${tone[status] ?? "text-[var(--muted)]"}`}>{statusLabel[status] ?? status}</span>;
}
