import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CasemixService } from './casemix.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/casemix')
export class CasemixController {
  constructor(private readonly casemixService: CasemixService) {}

  @Post('klaim')
  async kirimKlaim(@Body() data: { no_rawat: string; bypassNoSep?: string }, @Req() req: any) {
    const userRole = req.user?.role || 'user';
    const isAdminBypass = userRole === 'admin' || userRole === 'superadmin' || userRole === 'management';
    
    return this.casemixService.kirimKlaim(data.no_rawat, isAdminBypass, data.bypassNoSep);
  }
}
