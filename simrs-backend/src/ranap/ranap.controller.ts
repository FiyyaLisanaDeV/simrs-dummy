import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RanapService } from './ranap.service';

@Controller('ranap')
export class RanapController {
  constructor(private readonly ranapService: RanapService) {}

  @Get('kamar')
  async getKamar() {
    return this.ranapService.getKamarList();
  }

  @Post('admisi')
  async admisiPasien(@Body() body: any) {
    return this.ranapService.admisi(body);
  }

  @Post('cppt')
  async inputCPPT(@Body() body: any) {
    return this.ranapService.inputCPPT(body);
  }
}
