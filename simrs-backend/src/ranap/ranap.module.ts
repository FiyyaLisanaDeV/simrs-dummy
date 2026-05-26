import { Module } from '@nestjs/common';
import { RanapController } from './ranap.controller';
import { RanapService } from './ranap.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RanapController],
  providers: [RanapService],
})
export class RanapModule {}
