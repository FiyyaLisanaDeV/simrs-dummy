import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BpjsService } from '../bpjs/bpjs.service';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    private prisma: PrismaService,
    private bpjsService: BpjsService
  ) {}

  async createRegistration(data: {
    no_rkm_medis: string;
    kd_dokter: string;
    kd_poli: string;
    kd_pj: string;
    bypassNoSep?: string;
    isAdminBypass?: boolean;
  }) {
    const today = new Date();
    
    // Format YYYY/MM/DD
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '/');
    
    // Cari no rawat terakhir hari ini
    const lastReg = await this.prisma.reg_periksa.findFirst({
      where: {
        no_rawat: { startsWith: dateStr }
      },
      orderBy: { no_rawat: 'desc' }
    });

    let no_urut = "000001";
    if (lastReg) {
      const lastNo = parseInt(lastReg.no_rawat.split('/').pop() || "0");
      no_urut = (lastNo + 1).toString().padStart(6, '0');
    }
    const no_rawat = `${dateStr}/${no_urut}`;

    // Cari no antrean
    const lastAntrean = await this.prisma.reg_periksa.findFirst({
      where: {
        kd_poli: data.kd_poli,
        kd_dokter: data.kd_dokter,
        tgl_registrasi: today
      },
      orderBy: { no_reg: 'desc' }
    });

    let no_reg = "001";
    if (lastAntrean && lastAntrean.no_reg) {
      const lastRegNo = parseInt(lastAntrean.no_reg);
      no_reg = (lastRegNo + 1).toString().padStart(3, '0');
    }

    // Insert to database
    const reg = await this.prisma.reg_periksa.create({
      data: {
        no_rawat,
        no_reg,
        tgl_registrasi: today,
        jam_reg: today,
        kd_dokter: data.kd_dokter,
        no_rkm_medis: data.no_rkm_medis,
        kd_poli: data.kd_poli,
        kd_pj: data.kd_pj,
        p_jawab: 'Mandiri', // Default
        almt_pj: 'Alamat',
        hubunganpj: 'Sendiri',
        stts: 'Belum',
        stts_daftar: 'Lama',
        status_lanjut: 'Ralan',
        status_bayar: 'Belum_Bayar',
        status_poli: 'Lama',
        sttsumur: 'Th',
      }
    });

    // BPJS Bridging Logic (100% Otonom Default + Escape Hatch)
    if (data.kd_pj === 'BPJ') {
      try {
        const pasien = await this.prisma.pasien.findUnique({
          where: { no_rkm_medis: data.no_rkm_medis }
        });
        const noKartu = pasien?.no_peserta || '';
        
        await this.bpjsService.createSEP(
          noKartu,
          reg.no_rawat,
          data.kd_poli,
          data.kd_dokter,
          data.isAdminBypass,
          data.bypassNoSep
        );
      } catch (error) {
        this.logger.error(`Gagal membuat SEP: ${error.message}`);
        throw new Error(`Pendaftaran sukses, namun Bridging V-Claim gagal: ${error.message}`);
      }
    }

    return reg;
  }
}
