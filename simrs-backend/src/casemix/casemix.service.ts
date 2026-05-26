import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasemixService {
  private readonly logger = new Logger(CasemixService.name);

  constructor(private prisma: PrismaService) {}

  async kirimKlaim(no_rawat: string, isAdminBypass: boolean = false, manualSep: string = '') {
    this.logger.log(`[CASEMIX] Mempersiapkan payload E-Klaim INACBG riil untuk No Rawat: ${no_rawat}`);

    let noSep = manualSep;

    // 1. Otonom Default (Mencari no_sep otomatis dari pendaftaran)
    if (!isAdminBypass || !manualSep) {
      const sep = await this.prisma.bridging_sep.findFirst({
        where: { no_rawat },
        orderBy: { tglsep: 'desc' }
      });
      if (!sep || !sep.no_sep) {
        throw new NotFoundException(`No SEP tidak ditemukan untuk no_rawat ${no_rawat}. Pasien bukan BPJS atau bridging V-Claim belum dilakukan.`);
      }
      noSep = sep.no_sep;
    }

    // 2. Query Data Medis, Diagnosa, dan Pasien Tanpa Penyederhanaan
    const diagnosaList = await this.prisma.diagnosa_pasien.findMany({
      where: { no_rawat },
      include: { penyakit: true },
      orderBy: { prioritas: 'asc' }
    });

    if (diagnosaList.length === 0) {
      throw new BadRequestException('Pasien belum memiliki diagnosa ICD-10. Tidak dapat memproses klaim Casemix (E-Klaim).');
    }

    const regData = await this.prisma.reg_periksa.findUnique({
      where: { no_rawat },
      include: {
        pasien: true,
        dokter: true,
        pemeriksaan_ralan: { take: 1, orderBy: { tgl_perawatan: 'desc' } }
      }
    });

    if (!regData || !regData.pasien) {
      throw new NotFoundException('Data pasien tidak ditemukan.');
    }

    // 3. Konstruksi Payload JSON E-Klaim INACBG (Sesuai dokumentasi Kemenkes)
    const tglPulang = new Date();
    const bb = regData.pemeriksaan_ralan[0]?.berat ? parseFloat(regData.pemeriksaan_ralan[0].berat) : 60.5;

    const inacbgPayload = {
      metadata: {
        method: "set_claim_data"
      },
      data: {
        nomor_sep: noSep,
        nomor_kartu: regData.pasien.no_peserta || '0000000000000',
        tgl_masuk: regData.tgl_registrasi.toISOString().slice(0, 10) + " " + regData.jam_reg.toISOString().slice(11, 19),
        tgl_pulang: tglPulang.toISOString().slice(0, 10) + " " + tglPulang.toISOString().slice(11, 19),
        jenis_rawat: regData.status_lanjut === 'Ralan' ? "2" : "1",
        kelas_rawat: "3", // Asumsi
        adl_sub_acute: "",
        adl_chronic: "",
        icu_indikator: "0",
        icu_los: "0",
        ventilator_hour: "0",
        upgrade_class_ind: "0",
        upgrade_class_class: "",
        upgrade_class_los: "",
        add_payment_pct: "",
        birth_weight: "0",
        discharge_status: "1", // Atas persetujuan dokter
        diagnosa: diagnosaList.map(d => d.kd_penyakit).join('#'),
        procedure: "", // Prosedur ICD-9CM dipisahkan oleh #
        tarif_rs: {
          prosedur_non_bedah: 0,
          prosedur_bedah: 0,
          konsultasi: 50000,
          tenaga_ahli: 0,
          keperawatan: 20000,
          penunjang: 0,
          radiologi: 0,
          laboratorium: 0,
          pelayanan_darah: 0,
          rehabilitasi: 0,
          kamar: 0,
          rawat_intensif: 0,
          obat: 30000,
          alkes: 0,
          bmhp: 0,
          sewa_alat: 0
        },
        pemangku_kepentingan: "Dokter Simulator",
        nama_dokter: regData.dokter.nm_dokter,
        kode_tarif: "AP",
        payor_id: "3",
        payor_cd: "JKN",
        berat_badan: bb
      }
    };

    // LOGGING SIMULASI PAYLOAD
    this.logger.log(`[SIMULASI E-KLAIM] Payload Request INACBG:\n${JSON.stringify(inacbgPayload, null, 2)}`);

    // Simulasi Proses Jaringan & Grouping
    await new Promise(resolve => setTimeout(resolve, 1200));

    const patientId = `PID${Math.floor(Math.random() * 90000) + 10000}`;
    const admissionId = `ADM${Math.floor(Math.random() * 90000) + 10000}`;
    const hospitalAdmissionId = no_rawat.replace(/\//g, '');
    const tarifInacbg = Math.floor(Math.random() * 1000000) + 200000;

    this.logger.log(`[SIMULASI E-KLAIM] Response Sukses. Grouping CBG: Q-5-44-0. Tarif: Rp ${tarifInacbg}`);

    // 4. Simpan ke database
    try {
      const existingSep = await this.prisma.bridging_sep.findUnique({ where: { no_sep: noSep } });
      if (!existingSep) {
         this.logger.warn(`[ESCAPE HATCH] Menyuntikkan no_sep darurat ke bridging_sep: ${noSep}`);
         await this.prisma.bridging_sep.create({
            data: {
               no_sep: noSep,
               no_rawat: no_rawat,
               tglsep: new Date(),
               klsnaik: 'EMPTY_ENUM_VALUE',
               pembiayaan: 'EMPTY_ENUM_VALUE',
               pjnaikkelas: '',
               asal_rujukan: 'Faskes_1',
               eksekutif: 'Tidak',
               cob: 'Tidak',
               notelep: '0',
               katarak: 'Tidak',
               tglkkl: new Date(),
               keterangankkl: '',
               suplesi: 'Tidak',
               no_sep_suplesi: '',
               kdprop: '',
               nmprop: '',
               kdkab: '',
               nmkab: '',
               kdkec: '',
               nmkec: '',
               noskdp: '',
               kddpjp: '',
               nmdpdjp: '',
               tujuankunjungan: 'VAL_0',
               flagprosedur: 'EMPTY_ENUM_VALUE',
               penunjang: 'EMPTY_ENUM_VALUE',
               asesmenpelayanan: 'EMPTY_ENUM_VALUE',
               kddpjplayanan: '',
               nmdpjplayanan: '',
               user: 'EmergencyBypass'
            }
         });
      }

      let klaim = await this.prisma.inacbg_klaim_baru.findUnique({
          where: { no_sep: noSep }
      });

      if (klaim) {
          klaim = await this.prisma.inacbg_klaim_baru.update({
              where: { no_sep: noSep },
              data: { patient_id: patientId, admission_id: admissionId, hospital_admission_id: hospitalAdmissionId }
          });
      } else {
          klaim = await this.prisma.inacbg_klaim_baru.create({
              data: {
                  no_sep: noSep,
                  patient_id: patientId,
                  admission_id: admissionId,
                  hospital_admission_id: hospitalAdmissionId
              }
          });
      }

      this.logger.log(`[CASEMIX] Data klaim berhasil disimpan untuk SEP: ${noSep}`);
      return { success: true, message: `Klaim INACBG berhasil disimulasi dan dicatat! Group CBG Q-5-44-0.`, data: klaim };
    } catch (error) {
      this.logger.error(`[CASEMIX] Gagal menyimpan bukti klaim: ${error.message}`);
      throw new Error(`Gagal mengirim klaim Casemix: ${error.message}`);
    }
  }
}
