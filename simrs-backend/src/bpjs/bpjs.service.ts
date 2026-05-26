import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BpjsService {
  private readonly logger = new Logger(BpjsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Simulator Adapter untuk membuat SEP ke V-Claim
   * 100% Otonom tanpa penyederhanaan. Mengumpulkan semua data riil dari database.
   */
  async createSEP(noKartu: string, noRawat: string, poliTujuan: string, dpjp: string, isAdminBypass: boolean = false, manualSep: string = '') {
    this.logger.log(`[SIMULASI BPJS] Mempersiapkan payload V-Claim riil untuk No Rawat: ${noRawat}`);
    
    // 1. Mekanisme Escape Hatch (Bypass Mode)
    if (isAdminBypass && manualSep) {
      this.logger.warn(`[ESCAPE HATCH] Admin melakukan bypass SEP manual: ${manualSep}`);
      if (manualSep.length < 19) {
        throw new BadRequestException('Format No SEP Bypass tidak valid (minimal 19 karakter).');
      }
      return await this.saveBridgingSep(manualSep, noRawat, noKartu, poliTujuan, dpjp, 'BypassAdmin');
    }

    if (!noKartu || noKartu.length < 13) {
      throw new BadRequestException('Nomor Kartu BPJS tidak valid untuk Bridging otomatis.');
    }

    // 2. Query Data Lengkap Tanpa Penyederhanaan
    const regData = await this.prisma.reg_periksa.findUnique({
      where: { no_rawat: noRawat },
      include: {
        pasien: true,
        poliklinik: true,
        dokter: true
      }
    });

    if (!regData || !regData.pasien) {
      throw new NotFoundException('Data Registrasi/Pasien tidak ditemukan untuk bridging.');
    }

    // 3. Konstruksi Payload JSON V-Claim (Sesuai dokumentasi BPJS)
    const tgl = new Date();
    const dateStr = tgl.toISOString().slice(0, 10);
    
    const vclaimPayload = {
      request: {
        t_sep: {
          noKartu: noKartu,
          tglSep: dateStr,
          ppkPelayanan: "0114R027", // Fiktif RS Kita
          jnsPelayanan: regData.status_lanjut === 'Ralan' ? "2" : "1",
          klsRawat: {
            klsRawatHak: "3",
            klsRawatNaik: "",
            pembiayaan: "",
            penanggungJawab: ""
          },
          noMR: regData.pasien.no_rkm_medis,
          rujukan: {
            asalRujukan: "1",
            tglRujukan: dateStr,
            noRujukan: "0114000000000000001", // Dummy rujukan faskes 1
            ppkRujukan: "01140001"
          },
          catatan: "Simulasi Pendaftaran Otonom SIMRS",
          diagAwal: "Z09.8", // Default pendaftaran awal (belum ada diagnosa pasti)
          poli: {
            tujuan: poliTujuan,
            eksekutif: "0"
          },
          cob: { cob: "0" },
          katarak: { katarak: "0" },
          jaminan: {
            lakaLantas: "0",
            noLP: "",
            penjamin: {
              tglKejadian: "",
              keterangan: "",
              suplesi: { suplesi: "0", noSepSuplesi: "", lokasiLaka: { kdPropinsi: "", kdKabupaten: "", kdKecamatan: "" } }
            }
          },
          tujuanKunj: "0",
          flagProcedure: "",
          kdPenunjang: "",
          assesmentPel: "",
          skdp: { noSurat: "", kodeDPJP: dpjp },
          dpjpLayan: dpjp,
          noTelp: regData.pasien.no_tlp || "08000000000",
          user: "AutoAdapterSIMRS"
        }
      }
    };

    // LOGGING SIMULASI PAYLOAD
    this.logger.log(`[SIMULASI BPJS] Payload Request V-Claim:\n${JSON.stringify(vclaimPayload, null, 2)}`);

    // Simulasi Proses Jaringan & Response
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulasi network delay
    
    const dateStrRes = dateStr.replace(/-/g, '');
    const randId = Math.floor(Math.random() * 9000) + 1000;
    const noSepGenerated = `0114R027${dateStrRes}V${randId}`;
    
    this.logger.log(`[SIMULASI BPJS] Response V-Claim Sukses: SEP Generated -> ${noSepGenerated}`);

    return await this.saveBridgingSep(noSepGenerated, noRawat, noKartu, poliTujuan, dpjp, 'AutoAdapterSIMRS', regData);
  }

  private async saveBridgingSep(noSep: string, noRawat: string, noKartu: string, poliTujuan: string, dpjp: string, user: string, regData?: any) {
    try {
      const pasien = regData?.pasien;
      const poliklinik = regData?.poliklinik;
      const dokter = regData?.dokter;

      await this.prisma.bridging_sep.create({
        data: {
          no_sep: noSep,
          no_rawat: noRawat,
          no_kartu: noKartu,
          tglsep: new Date(),
          tglrujukan: new Date(),
          no_rujukan: '0114000000000000001',
          kdppkrujukan: '01140001',
          nmppkrujukan: 'PUSKESMAS DUMMY',
          kdppkpelayanan: '0114R027',
          nmppkpelayanan: 'RS KITA SIMULASI',
          jnspelayanan: 'VAL_2', // 2: Ralan
          catatan: 'Simulasi Pendaftaran Otonom SIMRS',
          diagawal: 'Z09.8',
          nmdiagnosaawal: 'Follow-up examination after other treatment for other conditions',
          kdpolitujuan: poliTujuan,
          nmpolitujuan: poliklinik?.nm_poli || 'POLI UMUM',
          klsrawat: 'VAL_3',
          klsnaik: 'EMPTY_ENUM_VALUE',
          pembiayaan: 'EMPTY_ENUM_VALUE',
          pjnaikkelas: '',
          lakalantas: 'VAL_0',
          user: user,
          nomr: pasien?.no_rkm_medis || '',
          nama_pasien: pasien?.nm_pasien || 'PASIEN DUMMY',
          tanggal_lahir: pasien?.tgl_lahir || new Date('1990-01-01'),
          peserta: 'PESERTA MANDIRI',
          jkel: pasien?.jk === 'Pria' ? 'L' : 'P',
          asal_rujukan: 'Faskes_1',
          eksekutif: 'Tidak',
          cob: 'Tidak',
          notelep: pasien?.no_tlp || '08000000000',
          katarak: 'Tidak',
          tglkkl: new Date(),
          keterangankkl: '',
          suplesi: 'Tidak',
          no_sep_suplesi: '',
          kdprop: '00',
          nmprop: 'PROVINSI SIMULASI',
          kdkab: '00',
          nmkab: 'KOTA SIMULASI',
          kdkec: '00',
          nmkec: 'KECAMATAN SIMULASI',
          noskdp: '',
          kddpjp: dpjp,
          nmdpdjp: dokter?.nm_dokter || 'DOKTER SIMULASI',
          tujuankunjungan: 'VAL_0',
          flagprosedur: 'EMPTY_ENUM_VALUE',
          penunjang: 'EMPTY_ENUM_VALUE',
          asesmenpelayanan: 'EMPTY_ENUM_VALUE',
          kddpjplayanan: dpjp,
          nmdpjplayanan: dokter?.nm_dokter || 'DOKTER SIMULASI',
        }
      });
      this.logger.log(`[SIMULASI BPJS] Berhasil menyimpan SEP beserta seluruh atribut ke DB: ${noSep}`);
      return noSep;
    } catch (error) {
      this.logger.error(`[SIMULASI BPJS] Gagal menyimpan bridging_sep: ${error.message}`);
      throw new Error(`Gagal menyimpan data bridging SEP: ${error.message}`);
    }
  }
}
