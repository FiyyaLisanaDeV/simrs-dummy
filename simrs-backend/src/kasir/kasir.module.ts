import { Module } from '@nestjs/common';
import { KasirController } from './kasir.controller';
import { KasirService } from './kasir.service';

@Module({
  controllers: [KasirController],
  providers: [KasirService]
})
export class KasirModule {}
