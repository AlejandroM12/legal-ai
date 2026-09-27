import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [AiModule, RetrievalModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
