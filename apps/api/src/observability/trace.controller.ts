import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TraceService } from './trace.service';

@Controller('traces')
@UseGuards(JwtAuthGuard)
export class TraceController {
  constructor(private readonly traces: TraceService) {}

  @Get()
  list(@CurrentUser() user: { userId: string }) {
    return this.traces.list(user.userId);
  }

  @Get(':id')
  async get(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const trace = await this.traces.get(user.userId, id);
    if (!trace) throw new NotFoundException('Traza no encontrada');
    return trace;
  }
}
