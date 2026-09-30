import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TraceInput {
  userId: string;
  question: string;
  model: string;
  embeddingMs: number;
  retrievalMs: number;
  llmMs: number;
  totalMs: number;
  retrievedChunks: number;
  promptTokens: number | null;
  completionTokens: number | null;
  tools: string | null;
  error: string | null;
}

@Injectable()
export class TraceService {
  constructor(private readonly prisma: PrismaService) {}

  record(input: TraceInput) {
    return this.prisma.questionTrace.create({ data: input });
  }

  list(userId: string) {
    return this.prisma.questionTrace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async get(userId: string, id: string) {
    return this.prisma.questionTrace.findFirst({ where: { id, userId } });
  }
}
