import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async getTodayQueues() {
    const today = new Date();
    // Prisma Date comparison for today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    return this.prisma.reg_periksa.findMany({
      where: {
        tgl_registrasi: {
          gte: startOfDay,
        },
        stts: 'Belum'
      },
      include: {
        pasien: {
          select: { nm_pasien: true }
        },
        poliklinik: {
          select: { nm_poli: true }
        }
      },
      orderBy: {
        no_reg: 'asc'
      },
      take: 50
    });
  }
}
