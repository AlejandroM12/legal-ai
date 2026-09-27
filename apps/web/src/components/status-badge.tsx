import { statusLabel } from "@/lib/status";

const tone: Record<string, string> = {
  PROCESSED: "badge badge-ready",
  FAILED: "badge badge-failed",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={tone[status] ?? "badge"}>{statusLabel[status] ?? status}</span>;
}
