import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperasiService {
  constructor(private prisma: PrismaService) {}

  async getPaketOperasi() {
    return this.prisma.paket_operasi.findMany({
      orderBy: { nm_perawatan: 'asc' },
      take: 50 // Limit to 50 for performance
    });
  }

  async inputOperasi(data: any) {
    const tgl = new Date();
    
    // Ambil tarif dari paket
    const paket = await this.prisma.paket_operasi.findUnique({ where: { kode_paket: data.kode_paket } });
    if (!paket) throw new Error('Paket operasi tidak ditemukan');

    // Create entry di operasi
    return this.prisma.operasi.create({
      data: {
        no_rawat: data.no_rawat,
        tgl_operasi: tgl,
        kode_paket: data.kode_paket,
        jenis_anasthesi: data.jenis_anasthesi || '-',
        kategori: data.kategori || 'Ringan',
        
        operator1: data.operator1 || '-',
        operator2: data.operator2 || '-',
        operator3: data.operator3 || '-',
        asisten_operator1: data.asisten_operator1 || '-',
        asisten_operator2: data.asisten_operator2 || '-',
        dokter_anak: data.dokter_anak || '-',
        perawaat_resusitas: data.perawaat_resusitas || '-',
        dokter_anestesi: data.dokter_anestesi || '-',
        asisten_anestesi: data.asisten_anestesi || '-',
        bidan: data.bidan || '-',
        perawat_luar: data.perawat_luar || '-',

        // Biaya dicopy dari paket
        biayaoperator1: paket.operator1 || 0,
        biayaoperator2: paket.operator2 || 0,
        biayaoperator3: paket.operator3 || 0,
        biayaasisten_operator1: paket.asisten_operator1 || 0,
        biayaasisten_operator2: paket.asisten_operator2 || 0,
        biayadokter_anak: paket.dokter_anak || 0,
        biayaperawaat_resusitas: paket.perawaat_resusitas || 0,
        biayadokter_anestesi: paket.dokter_anestesi || 0,
        biayaasisten_anestesi: paket.asisten_anestesi || 0,
        biayabidan: paket.bidan || 0,
        biayaperawat_luar: paket.perawat_luar || 0,
        biayaalat: paket.alat || 0,
        biayasewaok: paket.sewa_ok || 0,
        bagian_rs: paket.bagian_rs || 0,
        status: data.status || 'Ranap'
      }
    });
  }
}
