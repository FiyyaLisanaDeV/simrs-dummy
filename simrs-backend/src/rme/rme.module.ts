import { Module } from '@nestjs/common';
import { RmeService } from './rme.service';
import { RmeController } from './rme.controller';

@Module({
  providers: [RmeService],
  controllers: [RmeController]
})
export class RmeModule {}
