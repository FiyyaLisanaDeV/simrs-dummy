import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BpjsModule } from '../bpjs/bpjs.module';

@Module({
  imports: [PrismaModule, BpjsModule],
  providers: [RegistrationService],
  controllers: [RegistrationController]
})
export class RegistrationModule {}
