import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Get, Post, Body } from '@nestjs/common';
import { BedService } from './bed.service';

@UseGuards(JwtAuthGuard)
@Controller('api/beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Get('available')
  async getAvailable() {
    return this.bedService.getAvailableBeds();
  }

  @Post('admit')
  async admitPatient(@Body() body: { no_rawat: string, kd_kamar: string }) {
    return this.bedService.admitPatient(body);
  }
}
