import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Get, Post, Query, Body, HttpException } from '@nestjs/common';
import { FarmasiService } from './farmasi.service';

@UseGuards(JwtAuthGuard)
@Controller('farmasi')
export class FarmasiController {
  constructor(private readonly farmasiService: FarmasiService) {}

  @Get('obat')
  searchObat(@Query('keyword') keyword: string) {
    return this.farmasiService.searchObat(keyword || '');
  }

  @Get('stok')
  getStok(@Query('kode_brng') kode_brng: string) {
    return this.farmasiService.getStokGudang(kode_brng);
  }

  @Get('metode-racik')
  getMetodeRacik() {
    return this.farmasiService.getMetodeRacik();
  }

  @Post('resep')
  createResep(@Body() data: any) {
    return this.farmasiService.createResep(data);
  }

  @Get('antrean-resep')
  getAntrean() {
    return this.farmasiService.getAntreanResep();
  }

  @Post('validasi')
  async validasiResep(@Body() body: { no_resep: string }) {
    try {
      return await this.farmasiService.validasiResep(body.no_resep);
    } catch (e: any) {
      throw new HttpException({ message: e.message }, 500);
    }
  }

  @Post('serahkan')
  async serahkanObat(@Body() body: { no_resep: string; kd_bangsal_asal?: string }) {
    try {
      return await this.farmasiService.serahkanObat(body.no_resep, body.kd_bangsal_asal);
    } catch (e: any) {
      if (e.message.includes('Insufficient Stock')) {
        throw new HttpException({ message: e.message }, 400);
      }
      throw new HttpException({ message: e.message }, 500);
    }
  }
}
