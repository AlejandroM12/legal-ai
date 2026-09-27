export const defaults = {
  chatModel: "llama3.1",
  embeddingModel: "nomic-embed-text",
  embeddingDimensions: 768,
  qdrantCollection: "legal_chunks",
  chunkSize: 1200,
  chunkOverlap: 150,
  topK: 5,
  similarityThreshold: 0.25,
  maxUploadBytes: 20 * 1024 * 1024,
  agentMaxIterations: 6,
} as const;

export const documentStatuses = [
  "UPLOADED",
  "PROCESSING",
  "PROCESSED",
  "FAILED",
] as const;

export type DocumentStatus = (typeof documentStatuses)[number];
