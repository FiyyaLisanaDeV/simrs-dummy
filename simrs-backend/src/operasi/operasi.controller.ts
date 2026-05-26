import { Controller, Get, Post, Body } from '@nestjs/common';
import { OperasiService } from './operasi.service';

@Controller('operasi')
export class OperasiController {
  constructor(private readonly operasiService: OperasiService) {}

  @Get('paket')
  async getPaket() {
    return this.operasiService.getPaketOperasi();
  }

  @Post('input')
  async inputOperasi(@Body() body: any) {
    return this.operasiService.inputOperasi(body);
  }
}
