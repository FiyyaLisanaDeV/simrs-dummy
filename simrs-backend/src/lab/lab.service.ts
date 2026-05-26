import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  async getMasterLab(kategori: string) {
    return this.prisma.jns_perawatan_lab.findMany({
      where: {
        status: '1',
        // In SIMRS Dummy, there are classes, we can just fetch all or filter by class '-' (Rawat Jalan)
        kelas: '-',
        kategori: kategori || 'PK' // PK = Patologi Klinik
      },
      include: {
        // Unfortunately template_laboratorium has no direct relation defined in our schema back to jns_perawatan_lab in a way that Prisma include works out of the box because we didn't add the back relation in jns_perawatan_lab, let's just fetch it raw if needed.
        // Wait, I didn't add `template_laboratorium` relation in `jns_perawatan_lab`?
      }
    });
  }

  async getTemplateLab(kd_jenis_prw: string) {
    return this.prisma.template_laboratorium.findMany({
      where: { kd_jenis_prw },
      orderBy: { urut: 'asc' }
    });
  }

  async requestLab(data: any) {
    const { no_rawat, nip, kd_jenis_prw, dokter_perujuk } = data;
    const tgl_periksa = new Date();
    const jam = new Date();

    // Dapatkan data jns_perawatan_lab untuk biayanya
    const tarif = await this.prisma.jns_perawatan_lab.findUnique({
      where: { kd_jenis_prw }
    });

    if (!tarif) throw new BadRequestException('Tindakan Lab tidak ditemukan');

    // Default status 'Belum' artinya belum ada hasil
    return this.prisma.periksa_lab.create({
      data: {
        no_rawat,
        nip, // Analis (sementara kita isi default atau dari request)
        kd_jenis_prw,
        tgl_periksa,
        jam,
        dokter_perujuk,
        bagian_rs: tarif.bagian_rs || 0,
        bhp: tarif.bhp || 0,
        tarif_perujuk: tarif.tarif_perujuk || 0,
        tarif_tindakan_dokter: tarif.tarif_tindakan_dokter || 0,
        tarif_tindakan_petugas: tarif.tarif_tindakan_petugas || 0,
        kso: tarif.kso || 0,
        menejemen: tarif.menejemen || 0,
        biaya: tarif.total_byr || 0,
        kd_dokter: dokter_perujuk, // Dokter PJ Lab (bisa disesuaikan)
        status: 'Belum', 
        kategori: tarif.kategori || 'PK'
      }
    });
  }

  async getAntreanLab() {
    return this.prisma.periksa_lab.findMany({
      where: { status: 'Belum' },
      include: {
        reg_periksa: {
          include: { pasien: true }
        },
        jns_perawatan_lab: true
      },
      orderBy: { tgl_periksa: 'desc' }
    });
  }

  async saveHasilLab(data: any) {
    const { no_rawat, kd_jenis_prw, tgl_periksa, jam, hasil } = data; // hasil is array of { id_template, nilai, nilai_rujukan, keterangan }
    
    const tglPeriksaDate = new Date(tgl_periksa);
    const jamDate = new Date(jam);

    // Save each template result
    const transactions = hasil.map((h: any) => {
      return this.prisma.detail_periksa_lab.create({
        data: {
          no_rawat,
          kd_jenis_prw,
          tgl_periksa: tglPeriksaDate,
          jam: jamDate,
          id_template: h.id_template,
          nilai: h.nilai,
          nilai_rujukan: h.nilai_rujukan || '',
          keterangan: h.keterangan || '',
          // Biaya diset 0 karena sudah di-charge di periksa_lab header
          bagian_rs: 0,
          bhp: 0,
          bagian_perujuk: 0,
          bagian_dokter: 0,
          bagian_laborat: 0,
          kso: 0,
          menejemen: 0,
          biaya_item: 0
        }
      });
    });

    // Update status to Sudah
    transactions.push(
      this.prisma.periksa_lab.update({
        where: {
          no_rawat_kd_jenis_prw_tgl_periksa_jam: {
            no_rawat,
            kd_jenis_prw,
            tgl_periksa: tglPeriksaDate,
            jam: jamDate
          }
        },
        data: { status: 'Sudah' }
      }) as any
    );

    return this.prisma.$transaction(transactions);
  }
}
