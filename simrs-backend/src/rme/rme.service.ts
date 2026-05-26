import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RmeService {
  constructor(private prisma: PrismaService) {}

  // =============================================
  // SOAP / CPPT - Baca Riwayat Pemeriksaan
  // =============================================

  async getPatientCppt(no_rkm_medis: string) {
    // Riwayat SOAP rawat jalan
    const ralan = await this.prisma.pemeriksaan_ralan.findMany({
      where: {
        reg_periksa: { no_rkm_medis }
      },
      include: {
        reg_periksa: {
          select: { no_rawat: true, tgl_registrasi: true, poliklinik: { select: { nm_poli: true } } }
        },
        pegawai: { select: { nama: true } }
      },
      orderBy: [{ tgl_perawatan: 'desc' }, { jam_rawat: 'desc' }],
      take: 20
    });

    // Riwayat SOAP rawat inap
    const ranap = await this.prisma.pemeriksaan_ranap.findMany({
      where: {
        reg_periksa: { no_rkm_medis }
      },
      include: {
        reg_periksa: {
          select: { no_rawat: true, tgl_registrasi: true }
        },
        pegawai: { select: { nama: true } }
      },
      orderBy: [{ tgl_perawatan: 'desc' }, { jam_rawat: 'desc' }],
      take: 20
    });

    return { ralan, ranap };
  }

  // =============================================
  // INSERT SOAP baru (Rawat Jalan)
  // =============================================

  async createSoapRalan(data: {
    no_rawat: string;
    keluhan: string;
    pemeriksaan: string;
    penilaian: string;
    rtl: string;
    instruksi: string;
    evaluasi: string;
    kesadaran: string;
    tensi: string;
    nadi?: string;
    suhu_tubuh?: string;
    respirasi?: string;
    tinggi?: string;
    berat?: string;
    spo2?: string;
    gcs?: string;
    alergi?: string;
    nip: string;
  }) {
    const now = new Date();
    return this.prisma.pemeriksaan_ralan.create({
      data: {
        no_rawat: data.no_rawat,
        tgl_perawatan: now,
        jam_rawat: now,
        keluhan: data.keluhan,
        pemeriksaan: data.pemeriksaan,
        penilaian: data.penilaian,
        rtl: data.rtl,
        instruksi: data.instruksi || '',
        evaluasi: data.evaluasi || '',
        kesadaran: data.kesadaran || 'Compos Mentis',
        tensi: data.tensi || '',
        nadi: data.nadi || '',
        suhu_tubuh: data.suhu_tubuh || '',
        respirasi: data.respirasi || '',
        tinggi: data.tinggi || '',
        berat: data.berat || '',
        spo2: data.spo2 || '',
        gcs: data.gcs || '',
        alergi: data.alergi || '',
        lingkar_perut: '',
        nip: data.nip
      }
    });
  }

  // =============================================
  // Diagnosa ICD-10
  // =============================================

  async getPatientDiagnoses(no_rkm_medis: string) {
    return this.prisma.diagnosa_pasien.findMany({
      where: {
        reg_periksa: { no_rkm_medis }
      },
      include: {
        penyakit: { select: { nm_penyakit: true } },
        reg_periksa: { select: { no_rawat: true, tgl_registrasi: true } }
      },
      orderBy: { prioritas: 'asc' }
    });
  }

  async addDiagnosis(data: {
    no_rawat: string;
    kd_penyakit: string;
    status: string;
    prioritas: number;
    status_penyakit: string;
  }) {
    return this.prisma.diagnosa_pasien.create({
      data: {
        no_rawat: data.no_rawat,
        kd_penyakit: data.kd_penyakit,
        status: data.status || 'Ralan',
        prioritas: data.prioritas || 1,
        status_penyakit: data.status_penyakit || 'Baru'
      }
    });
  }

  // =============================================
  // Pencarian ICD-10 (Master Penyakit)
  // =============================================

  async searchIcd10(keyword: string) {
    return this.prisma.penyakit.findMany({
      where: {
        OR: [
          { kd_penyakit: { contains: keyword } },
          { nm_penyakit: { contains: keyword } }
        ]
      },
      take: 15
    });
  }
}
