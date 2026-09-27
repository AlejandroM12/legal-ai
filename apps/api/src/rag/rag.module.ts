import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../observability/observability.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { AiModule } from '../ai/ai.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [AiModule, RetrievalModule, ObservabilityModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
