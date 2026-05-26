import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/stats')
  async getStats() {
    // 1. Total Pasien (Semua Registrasi dari Simulasi)
    const totalPasien = await this.prisma.reg_periksa.count();

    // 2. Pendapatan All-Time (Total Debit dari Kas Kasir 111010)
    const rawPendapatan = await this.prisma.detailjurnal.aggregate({
      where: {
        kd_rek: '111010'
      },
      _sum: {
        debet: true
      }
    });
    const pendapatan = rawPendapatan._sum.debet || 0;

    // 3. Poli Aktif (Jumlah Poli yang Memiliki Kunjungan)
    const activePolis = await this.prisma.reg_periksa.groupBy({
      by: ['kd_poli']
    });

    return {
      totalPasien,
      pendapatan,
      poliAktif: activePolis.length
    };
  }

  @Get('api/monitoring/stats')
  async getMonitoringStats() {
    const pasienCount = await this.prisma.pasien.count();
    const regCount = await this.prisma.reg_periksa.count();
    const soapRalanCount = await this.prisma.pemeriksaan_ralan.count();
    const soapRanapCount = await this.prisma.pemeriksaan_ranap.count();
    const labCount = await this.prisma.periksa_lab.count();
    const opCount = await this.prisma.operasi.count();
    const prescriptionCount = await this.prisma.resep_obat.count();
    const notaCount = await this.prisma.nota_jalan.count();
    const journalCount = await this.prisma.jurnal.count();
    const mutationCount = await this.prisma.riwayat_barang_medis.count();

    // Hitung audit balance akuntansi
    const rawBalance = await this.prisma.detailjurnal.aggregate({
      _sum: {
        debet: true,
        kredit: true
      }
    });

    const isBalanced = (rawBalance._sum.debet || 0) === (rawBalance._sum.kredit || 0);

    return {
      counts: {
        pasien: pasienCount,
        registrasi: regCount,
        soapRalan: soapRalanCount,
        soapRanap: soapRanapCount,
        lab: labCount,
        operasi: opCount,
        resep: prescriptionCount,
        nota: notaCount,
        jurnal: journalCount,
        mutasi: mutationCount
      },
      audit: {
        totalDebit: rawBalance._sum.debet || 0,
        totalKredit: rawBalance._sum.kredit || 0,
        isBalanced
      }
    };
  }

  @Get('api/monitoring/data')
  async getMonitoringData(
    @Query('type') type: string,
    @Query('search') search?: string,
  ) {
    const limit = 50;

    if (type === 'pasien') {
      return this.prisma.pasien.findMany({
        where: search ? {
          OR: [
            { no_rkm_medis: { contains: search } },
            { nm_pasien: { contains: search } }
          ]
        } : undefined,
        orderBy: { no_rkm_medis: 'desc' },
        take: limit
      });
    }

    if (type === 'registrasi') {
      return this.prisma.reg_periksa.findMany({
        where: search ? {
          OR: [
            { no_rawat: { contains: search } },
            { no_rkm_medis: { contains: search } }
          ]
        } : undefined,
        include: {
          pasien: true,
          dokter: true,
          poliklinik: true
        },
        orderBy: { no_rawat: 'desc' },
        take: limit
      });
    }

    if (type === 'soap') {
      const ralan = await this.prisma.pemeriksaan_ralan.findMany({
        where: search ? { no_rawat: { contains: search } } : undefined,
        include: {
          reg_periksa: {
            include: { pasien: true }
          }
        },
        orderBy: { no_rawat: 'desc' },
        take: limit / 2
      });

      const ranap = await this.prisma.pemeriksaan_ranap.findMany({
        where: search ? { no_rawat: { contains: search } } : undefined,
        include: {
          reg_periksa: {
            include: { pasien: true }
          }
        },
        orderBy: { no_rawat: 'desc' },
        take: limit / 2
      });

      return { ralan, ranap };
    }

    if (type === 'resep') {
      return this.prisma.resep_obat.findMany({
        where: search ? { no_rawat: { contains: search } } : undefined,
        include: {
          dokter: true,
          reg_periksa: {
            include: { pasien: true }
          },
          resep_dokter: true
        },
        orderBy: { no_resep: 'desc' },
        take: limit
      });
    }

    if (type === 'jurnal') {
      return this.prisma.jurnal.findMany({
        where: search ? {
          OR: [
            { no_jurnal: { contains: search } },
            { no_bukti: { contains: search } }
          ]
        } : undefined,
        include: {
          detailjurnal: {
            include: {
              rekening: true
            }
          }
        },
        orderBy: { no_jurnal: 'desc' },
        take: limit
      });
    }

    if (type === 'mutasi') {
      return this.prisma.riwayat_barang_medis.findMany({
        where: search ? { kode_brng: { contains: search } } : undefined,
        include: {
          bangsal: true,
          databarang: true
        },
        orderBy: { jam: 'desc' },
        take: limit
      });
    }

    return [];
  }
}
