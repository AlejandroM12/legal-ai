import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgentDto } from './agent.dto';
import { AgentService } from './agent.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  @Post('agent/run')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  run(@CurrentUser() user: { userId: string }, @Body() body: AgentDto) {
    return this.agent.run(user.userId, body.message, body.documentIds);
  }
}
