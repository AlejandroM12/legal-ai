export interface VectorPoint {
  id: string;
  vector: number[];
  payload: {
    user_id: string;
    document_id: string;
    page: number;
    chunk_id: string;
    text: string;
  };
}

export interface VectorFilter {
  userId: string;
  documentId?: string;
  documentIds?: string[];
}

export interface VectorHit {
  chunkId: string;
  documentId: string;
  page: number;
  text: string;
  score: number;
}

export interface VectorStore {
  ensureCollection(dimensions: number): Promise<void>;
  upsert(points: VectorPoint[]): Promise<void>;
  search(
    vector: number[],
    filter: VectorFilter,
    limit: number,
    threshold: number,
  ): Promise<VectorHit[]>;
  deleteByDocument(documentId: string, userId: string): Promise<void>;
}
