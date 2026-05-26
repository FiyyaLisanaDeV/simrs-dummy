import { Module } from '@nestjs/common';
import { FarmasiService } from './farmasi.service';
import { FarmasiController } from './farmasi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FarmasiService],
  controllers: [FarmasiController]
})
export class FarmasiModule {}
