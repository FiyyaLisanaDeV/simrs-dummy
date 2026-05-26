import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LabService } from './lab.service';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get('master')
  async getMasterLab(@Query('kategori') kategori: string) {
    return this.labService.getMasterLab(kategori);
  }

  @Get('template')
  async getTemplateLab(@Query('kd_jenis_prw') kd_jenis_prw: string) {
    return this.labService.getTemplateLab(kd_jenis_prw);
  }

  @Post('request')
  async requestLab(@Body() data: any) {
    return this.labService.requestLab(data);
  }

  @Get('antrean')
  async getAntreanLab() {
    return this.labService.getAntreanLab();
  }

  @Post('hasil')
  async saveHasilLab(@Body() data: any) {
    return this.labService.saveHasilLab(data);
  }
}
