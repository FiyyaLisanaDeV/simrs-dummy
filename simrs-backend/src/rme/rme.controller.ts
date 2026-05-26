import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Get, Post, Query, Param, Body } from '@nestjs/common';
import { RmeService } from './rme.service';

@UseGuards(JwtAuthGuard)
@Controller('api/rme')
export class RmeController {
  constructor(private readonly rmeService: RmeService) {}

  // GET /api/rme/cppt/:rm - Riwayat SOAP/CPPT pasien berdasarkan No RM
  @Get('cppt/:rm')
  async getCppt(@Param('rm') rm: string) {
    return this.rmeService.getPatientCppt(rm);
  }

  // POST /api/rme/soap - Simpan SOAP baru
  @Post('soap')
  async createSoap(@Body() body: any) {
    return this.rmeService.createSoapRalan(body);
  }

  // GET /api/rme/diagnoses/:rm - Riwayat diagnosa ICD-10 pasien
  @Get('diagnoses/:rm')
  async getDiagnoses(@Param('rm') rm: string) {
    return this.rmeService.getPatientDiagnoses(rm);
  }

  // POST /api/rme/diagnosis - Tambah diagnosa ICD-10
  @Post('diagnosis')
  async addDiagnosis(@Body() body: any) {
    return this.rmeService.addDiagnosis(body);
  }

  // GET /api/rme/icd10?q=keyword - Pencarian kode ICD-10
  @Get('icd10')
  async searchIcd10(@Query('q') q: string) {
    if (!q || q.length < 2) return [];
    return this.rmeService.searchIcd10(q);
  }
}
