import { Module } from '@nestjs/common';
import { BpjsService } from './bpjs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BpjsService],
  exports: [BpjsService],
})
export class BpjsModule {}
