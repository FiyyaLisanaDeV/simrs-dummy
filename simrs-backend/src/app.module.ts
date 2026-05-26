import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PatientModule } from './patient/patient.module';
import { RegistrationModule } from './registration/registration.module';
import { QueueModule } from './queue/queue.module';
import { BedModule } from './bed/bed.module';
import { RmeModule } from './rme/rme.module';
import { FarmasiModule } from './farmasi/farmasi.module';
import { KasirModule } from './kasir/kasir.module';
import { BpjsModule } from './bpjs/bpjs.module';
import { CasemixModule } from './casemix/casemix.module';
import { LabModule } from './lab/lab.module';
import { RanapModule } from './ranap/ranap.module';
import { OperasiModule } from './operasi/operasi.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PrismaModule, PatientModule, RegistrationModule, QueueModule, BedModule, RmeModule, FarmasiModule, KasirModule, BpjsModule, CasemixModule, LabModule, RanapModule, OperasiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
