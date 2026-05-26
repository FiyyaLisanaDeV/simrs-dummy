import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Get } from '@nestjs/common';
import { QueueService } from './queue.service';

@UseGuards(JwtAuthGuard)
@Controller('api/queues')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('today')
  async getTodayQueues() {
    return this.queueService.getTodayQueues();
  }
}
