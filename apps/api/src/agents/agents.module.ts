import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ObservabilityModule } from '../observability/observability.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { AgentToolkit } from './agent.toolkit';

@Module({
  imports: [AiModule, RetrievalModule, ObservabilityModule],
  controllers: [AgentController],
  providers: [AgentToolkit, AgentService],
})
export class AgentsModule {}
