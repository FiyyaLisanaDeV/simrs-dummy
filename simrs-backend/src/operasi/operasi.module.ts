import { Module } from '@nestjs/common';
import { OperasiController } from './operasi.controller';
import { OperasiService } from './operasi.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperasiController],
  providers: [OperasiService],
})
export class OperasiModule {}
