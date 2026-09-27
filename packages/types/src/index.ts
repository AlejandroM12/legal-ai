import type { DocumentStatus } from "@legal-ai/config";

export type { DocumentStatus };

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  status: DocumentStatus;
  mimeType: string;
  size: number;
  errorMessage: string | null;
  createdAt: string;
}

export interface PageRecord {
  page: number;
  text: string;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  page: number;
  chunkIndex: number;
  text: string;
}

export interface Citation {
  documentId: string;
  filename: string;
  page: number;
  chunkId: string;
  text: string;
  score: number;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
  traceId: string;
}

export interface TraceRecord {
  id: string;
  question: string;
  model: string;
  embeddingMs: number;
  retrievalMs: number;
  llmMs: number;
  totalMs: number;
  retrievedChunks: number;
  promptTokens: number | null;
  completionTokens: number | null;
  error: string | null;
  createdAt: string;
}

export interface SearchHit {
  chunkId: string;
  documentId: string;
  filename: string;
  page: number;
  text: string;
  score: number;
}
