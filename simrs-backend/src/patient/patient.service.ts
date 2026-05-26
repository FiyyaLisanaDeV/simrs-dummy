import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async searchPatients(keyword: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { nm_pasien: { contains: keyword } },
        { no_ktp: { contains: keyword } },
        { no_rkm_medis: { contains: keyword } }
      ]
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pasien.findMany({
        where,
        include: { penjab: true },
        skip,
        take: limit
      }),
      this.prisma.pasien.count({ where })
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPatientByRm(no_rkm_medis: string) {
    return this.prisma.pasien.findUnique({
      where: { no_rkm_medis },
      include: { penjab: true }
    });
  }
}
