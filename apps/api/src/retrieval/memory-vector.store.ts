import { Injectable } from '@nestjs/common';
import {
  VectorFilter,
  VectorHit,
  VectorPoint,
  VectorStore,
} from './vector-store';

@Injectable()
export class MemoryVectorStore implements VectorStore {
  private points: VectorPoint[] = [];
  private dimensions = 0;

  ensureCollection(dimensions: number) {
    this.dimensions = dimensions;
    return Promise.resolve();
  }

  upsert(points: VectorPoint[]) {
    for (const point of points) {
      this.points = this.points.filter((existing) => existing.id !== point.id);
      this.points.push(point);
    }
    return Promise.resolve();
  }

  search(
    vector: number[],
    filter: VectorFilter,
    limit: number,
    threshold: number,
  ): Promise<VectorHit[]> {
    return Promise.resolve(
      this.points
        .filter((point) => matchesFilter(point, filter))
        .map((point) => ({
          chunkId: point.payload.chunk_id,
          documentId: point.payload.document_id,
          page: point.payload.page,
          text: point.payload.text,
          score: cosine(vector, point.vector),
        }))
        .filter((hit) => hit.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit),
    );
  }

  deleteByDocument(documentId: string) {
    this.points = this.points.filter(
      (point) => point.payload.document_id !== documentId,
    );
    return Promise.resolve();
  }

  size() {
    return this.points.length;
  }

  get dimensionsInUse() {
    return this.dimensions;
  }
}

function matchesFilter(point: VectorPoint, filter: VectorFilter) {
  if (point.payload.user_id !== filter.userId) return false;
  if (filter.documentId && point.payload.document_id !== filter.documentId)
    return false;
  if (
    filter.documentIds &&
    !filter.documentIds.includes(point.payload.document_id)
  )
    return false;
  return true;
}

function cosine(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / Math.sqrt(leftNorm * rightNorm);
}
