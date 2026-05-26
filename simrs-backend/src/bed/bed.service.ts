import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BedService {
  constructor(private prisma: PrismaService) {}

  async getAvailableBeds() {
    return this.prisma.kamar.findMany({
      where: {
        status: 'KOSONG',
        statusdata: '1'
      },
      include: {
        bangsal: true
      },
      take: 50
    });
  }

  async admitPatient(data: { no_rawat: string, kd_kamar: string }) {
    const today = new Date();
    const bed = await this.prisma.kamar.findUnique({ where: { kd_kamar: data.kd_kamar }});
    if (!bed) throw new Error("Kamar tidak ditemukan");
    
    // Transaksi Prisma:
    // 1. Insert ke kamar_inap
    // 2. Update status kamar menjadi ISI
    return this.prisma.$transaction(async (tx) => {
      const inap = await tx.kamar_inap.create({
        data: {
          no_rawat: data.no_rawat,
          kd_kamar: data.kd_kamar,
          trf_kamar: bed.trf_kamar,
          diagnosa_awal: '-',
          diagnosa_akhir: '-',
          tgl_masuk: today,
          jam_masuk: today,
          stts_pulang: '-',
          lama: 0,
          ttl_biaya: 0
        }
      });
      
      await tx.kamar.update({
        where: { kd_kamar: data.kd_kamar },
        data: { status: 'ISI' }
      });
      
      return inap;
    });
  }
}
