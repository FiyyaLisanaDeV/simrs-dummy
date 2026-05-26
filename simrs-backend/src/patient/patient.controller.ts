import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Get, Query, Param } from '@nestjs/common';
import { PatientService } from './patient.service';

@UseGuards(JwtAuthGuard)
@Controller('api/patients')
// @UseGuards(AuthGuard) // Commented out for now to ease testing, will enable later
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('search')
  async search(
    @Query('q') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);

    if (!keyword || keyword.length < 3) {
      return { 
        data: [], 
        meta: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } 
      };
    }
    
    return this.patientService.searchPatients(keyword, pageNum, limitNum);
  }

  @Get(':rm')
  async getDetail(@Param('rm') rm: string) {
    return this.patientService.getPatientByRm(rm);
  }
}
