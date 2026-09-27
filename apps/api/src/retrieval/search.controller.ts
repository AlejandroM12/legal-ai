import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RetrievalService } from './retrieval.service';
import { SearchDto } from './search.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly retrieval: RetrievalService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('search')
  async search(
    @CurrentUser() user: { userId: string },
    @Body() body: SearchDto,
  ) {
    const hits = await this.retrieval.search(body.query, {
      userId: user.userId,
      documentId: body.documentId,
    });
    const documents = await this.prisma.document.findMany({
      where: {
        userId: user.userId,
        id: { in: hits.map((hit) => hit.documentId) },
      },
    });
    const names = new Map(
      documents.map((document) => [document.id, document.filename]),
    );
    return hits
      .filter((hit) => names.has(hit.documentId))
      .map((hit) => ({
        chunkId: hit.chunkId,
        documentId: hit.documentId,
        filename: names.get(hit.documentId),
        page: hit.page,
        text: hit.text,
        score: hit.score,
      }));
  }
}
