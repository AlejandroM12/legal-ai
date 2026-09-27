import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { MemoryVectorStore } from './memory-vector.store';
import { QdrantVectorStore } from './qdrant-vector.store';
import { RetrievalService } from './retrieval.service';
import { SearchController } from './search.controller';
import { VECTOR_STORE } from './vector.tokens';

@Module({
  imports: [AiModule],
  controllers: [SearchController],
  providers: [
    RetrievalService,
    MemoryVectorStore,
    QdrantVectorStore,
    {
      provide: VECTOR_STORE,
      inject: [ConfigService, MemoryVectorStore, QdrantVectorStore],
      useFactory: (
        config: ConfigService,
        memory: MemoryVectorStore,
        qdrant: QdrantVectorStore,
      ) => (config.get('VECTOR_STORE') === 'memory' ? memory : qdrant),
    },
  ],
  exports: [RetrievalService, VECTOR_STORE],
})
export class RetrievalModule {}
