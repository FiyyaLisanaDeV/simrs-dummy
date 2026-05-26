import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RanapService {
  constructor(private prisma: PrismaService) {}

  async getKamarList() {
    return this.prisma.kamar.findMany({
      include: {
        bangsal: true,
      },
      orderBy: {
        kd_kamar: 'asc'
      }
    });
  }

  async admisi(data: { no_rawat: string; kd_kamar: string; diagnosa_awal: string }) {
    const tgl = new Date();
    
    // Check available kamar
    const kamar = await this.prisma.kamar.findUnique({ where: { kd_kamar: data.kd_kamar } });
    if (!kamar || kamar.statusdata === '0') throw new Error('Kamar tidak tersedia atau sedang kotor.');

    return this.prisma.$transaction([
      this.prisma.kamar_inap.create({
        data: {
          no_rawat: data.no_rawat,
          kd_kamar: data.kd_kamar,
          trf_kamar: kamar.trf_kamar || 0,
          diagnosa_awal: data.diagnosa_awal,
          tgl_masuk: tgl,
          jam_masuk: tgl,
          stts_pulang: '-',
        }
      }),
      this.prisma.kamar.update({
        where: { kd_kamar: data.kd_kamar },
        data: { statusdata: '0', status: 'ISI' } // 0 means occupied, 'ISI' is string status
      }),
      this.prisma.reg_periksa.update({
        where: { no_rawat: data.no_rawat },
        data: { status_lanjut: 'Ranap', stts: 'Dirawat' }
      })
    ]);
  }

  async inputCPPT(data: any) {
    const tgl = new Date();
    return this.prisma.pemeriksaan_ranap.create({
      data: {
        no_rawat: data.no_rawat,
        tgl_perawatan: tgl,
        jam_rawat: tgl,
        keluhan: data.keluhan,
        pemeriksaan: data.pemeriksaan,
        penilaian: data.penilaian,
        rtl: data.rtl,
        suhu_tubuh: data.suhu_tubuh,
        tensi: data.tensi,
        nadi: data.nadi,
        respirasi: data.respirasi,
        spo2: data.spo2 || '-',
        tinggi: data.tinggi || '-',
        berat: data.berat || '-',
        gcs: data.gcs || '-',
        kesadaran: data.kesadaran || 'Compos Mentis',
        instruksi: data.instruksi || '',
        evaluasi: data.evaluasi || '',
        nip: data.nip,
      }
    });
  }
}
