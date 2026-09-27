export const statusLabel: Record<string, string> = {
  UPLOADED: "En cola",
  PROCESSING: "Procesando",
  PROCESSED: "Listo",
  FAILED: "Falló",
};

export function formatBytes(size: number) {
  return `${Math.ceil(size / 1024)} KB`;
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const rest = totalSeconds % 60;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} s`;
}
