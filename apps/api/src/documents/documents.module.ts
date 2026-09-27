import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuditModule, IngestionModule, RetrievalModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
