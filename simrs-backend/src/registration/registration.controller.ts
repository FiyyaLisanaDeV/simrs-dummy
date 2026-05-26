import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, UseGuards, Post, Body, Req } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@UseGuards(JwtAuthGuard)
@Controller('api/registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async register(@Body() data: any, @Req() req: any) {
    // Escape hatch check: user role dari token JWT
    const userRole = req.user?.role || 'user';
    const isAdminBypass = userRole === 'admin' || userRole === 'superadmin' || userRole === 'management';
    
    return this.registrationService.createRegistration({
      no_rkm_medis: data.no_rkm_medis,
      kd_dokter: data.kd_dokter,
      kd_poli: data.kd_poli,
      kd_pj: data.kd_pj,
      bypassNoSep: data.bypassNoSep,
      isAdminBypass: isAdminBypass
    });
  }
}
