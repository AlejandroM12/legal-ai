import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { PdfUpload } from './validate-upload';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }),
  )
  create(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: PdfUpload,
  ) {
    return this.documents.create(user.userId, file);
  }

  @Get()
  list(@CurrentUser() user: { userId: string }) {
    return this.documents.list(user.userId);
  }

  @Get(':id')
  get(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documents.get(user.userId, id);
  }

  @Get(':id/pages')
  pages(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documents.pages(user.userId, id);
  }

  @Get(':id/chunks')
  chunks(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documents.chunks(user.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documents.remove(user.userId, id);
  }
}
