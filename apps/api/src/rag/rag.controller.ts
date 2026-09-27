import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AskDto } from './ask.dto';
import { RagService } from './rag.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RagController {
  constructor(private readonly rag: RagService) {}

  @Post('documents/:id/ask')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  ask(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: AskDto,
  ) {
    return this.rag.ask(user.userId, body.question, id);
  }

  @Post('ask')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  askAll(@CurrentUser() user: { userId: string }, @Body() body: AskDto) {
    return this.rag.ask(user.userId, body.question);
  }
}
