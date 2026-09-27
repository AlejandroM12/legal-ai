export interface DocumentRecord {
  id: string;
  filename: string;
  status: string;
  size: number;
  errorMessage: string | null;
}

export interface ChunkRecord {
  id: string;
  page: number;
  chunkIndex: number;
  text: string;
}

export interface Citation {
  filename: string;
  page: number;
  text: string;
  chunkId: string;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
}

export interface SearchHit {
  chunkId: string;
  filename: string;
  page: number;
  text: string;
}

export interface TraceRecord {
  id: string;
  question: string;
  totalMs: number;
  retrievedChunks: number;
  llmMs: number;
  embeddingMs: number;
  model: string;
}
