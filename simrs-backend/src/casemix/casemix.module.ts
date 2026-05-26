import { Module } from '@nestjs/common';
import { CasemixService } from './casemix.service';
import { CasemixController } from './casemix.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CasemixService],
  controllers: [CasemixController]
})
export class CasemixModule {}
