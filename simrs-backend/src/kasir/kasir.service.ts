import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KasirService {
  constructor(private prisma: PrismaService) {}

  async getTagihan(no_rawat: string) {
    const pendaftaran = await this.prisma.reg_periksa.findUnique({
      where: { no_rawat },
      include: {
        pasien: true,
        dokter: true,
        poliklinik: true,
      },
    });

    if (!pendaftaran) {
      throw new NotFoundException(`No Rawat ${no_rawat} tidak ditemukan`);
    }

    // 1. Biaya Registrasi
    const biayaReg = pendaftaran.biaya_reg || 0;

    // 2. Biaya Tindakan Dokter
    const tindakanList = await this.prisma.rawat_jl_dr.findMany({
      where: {
        no_rawat,
        stts_bayar: 'Belum',
      },
      include: {
        jns_perawatan: true,
      },
    });

    const biayaTindakan = tindakanList.reduce(
      (sum, item) => sum + (item.biaya_rawat || 0),
      0,
    );

    // 3. Biaya Obat (Membaca hasil validasi Apoteker dari detail_pemberian_obat)
    const pemberianList = await this.prisma.detail_pemberian_obat.findMany({
      where: { no_rawat },
    });

    let biayaObat = 0;
    const rincianObat = [];

    for (const item of pemberianList) {
      // Manual fetch databarang to get nama_brng because there is no foreign key in schema
      const databarang = await this.prisma.databarang.findUnique({
        where: { kode_brng: item.kode_brng }
      });
      
      biayaObat += item.total || 0;
      rincianObat.push({
        nama: databarang?.nama_brng || 'Obat',
        jml: item.jml,
        harga: item.biaya_obat,
        total: item.total,
      });
    }

    // 4. Biaya Laboratorium (periksa_lab)
    const periksaLabList = await this.prisma.periksa_lab.findMany({
      where: { no_rawat }, // Tidak perlu ngecek status 'Sudah' karena request lab aja udah nge-charge
      include: {
        jns_perawatan_lab: true
      }
    });

    const biayaLab = periksaLabList.reduce((sum, item) => sum + (item.biaya || 0), 0);

    // 5. Biaya Kamar Inap (kamar_inap)
    const kamarInapList = await this.prisma.kamar_inap.findMany({
      where: { no_rawat }
    });

    let biayaKamar = 0;
    const rincianKamar = [];
    for (const k of kamarInapList) {
      const tglMasuk = k.tgl_masuk.getTime();
      const tglKeluar = k.tgl_keluar ? k.tgl_keluar.getTime() : new Date().getTime();
      const lamaInap = Math.max(1, Math.ceil((tglKeluar - tglMasuk) / (1000 * 60 * 60 * 24))); // Minimal 1 hari
      const totalKamar = lamaInap * (k.trf_kamar || 0);
      biayaKamar += totalKamar;
      
      rincianKamar.push({
        kamar: k.kd_kamar,
        lama_inap: lamaInap,
        tarif: k.trf_kamar,
        total: totalKamar
      });
    }

    // 6. Biaya Kamar Operasi (operasi)
    const operasiList = await this.prisma.operasi.findMany({
      where: { no_rawat },
      include: { paket_operasi: true }
    });

    let biayaOperasi = 0;
    const rincianOperasi = [];
    for (const op of operasiList) {
      const totalOp = (op.biayaoperator1 || 0) + (op.biayaoperator2 || 0) + (op.biayaoperator3 || 0) +
                      (op.biayaasisten_operator1 || 0) + (op.biayaasisten_operator2 || 0) + (op.biayaasisten_operator3 || 0) +
                      (op.biayainstrumen || 0) + (op.biayadokter_anak || 0) + (op.biayaperawaat_resusitas || 0) +
                      (op.biayadokter_anestesi || 0) + (op.biayaasisten_anestesi || 0) + (op.biayaasisten_anestesi2 || 0) +
                      (op.biayabidan || 0) + (op.biayabidan2 || 0) + (op.biayabidan3 || 0) +
                      (op.biayaperawat_luar || 0) + (op.biayaalat || 0) + (op.biayasewaok || 0) +
                      (op.akomodasi || 0) + (op.bagian_rs || 0) + (op.biaya_omloop || 0) + (op.biaya_omloop2 || 0) +
                      (op.biaya_omloop3 || 0) + (op.biaya_omloop4 || 0) + (op.biaya_omloop5 || 0) +
                      (op.biayasarpras || 0) + (op.biaya_dokter_pjanak || 0) + (op.biaya_dokter_umum || 0);
      biayaOperasi += totalOp;
      
      rincianOperasi.push({
        nama: op.paket_operasi?.nm_perawatan || 'Tindakan Operasi',
        total: totalOp
      });
    }

    // Grand Total
    const grandTotal = biayaReg + biayaTindakan + biayaObat + biayaLab + biayaKamar + biayaOperasi;

    return {
      pasien: pendaftaran.pasien.nm_pasien,
      no_rawat,
      poliklinik: pendaftaran.poliklinik.nm_poli,
      dokter: pendaftaran.dokter.nm_dokter,
      status_bayar: pendaftaran.status_bayar,
      rincian: {
        registrasi: biayaReg,
        tindakan: biayaTindakan,
        obat: biayaObat,
        lab: biayaLab,
        kamar: biayaKamar,
        operasi: biayaOperasi,
      },
      rincianTindakan: tindakanList.map(t => ({
         nama: t.jns_perawatan?.nm_perawatan || 'Tindakan',
         biaya: t.biaya_rawat
      })),
      rincianObat,
      rincianLab: periksaLabList.map(l => ({
         nama: l.jns_perawatan_lab?.nm_perawatan || 'Laboratorium',
         biaya: l.biaya
      })),
      rincianKamar,
      rincianOperasi,
      grandTotal,
    };
  }

  async bayar(no_rawat: string, nominal_bayar: number) {
    const tagihan = await this.getTagihan(no_rawat);

    if (tagihan.status_bayar === 'Sudah_Bayar') {
      throw new Error('Pasien ini sudah lunas.');
    }

    if (nominal_bayar < tagihan.grandTotal) {
      throw new Error('Nominal bayar kurang dari total tagihan.');
    }

    // Validasi Hard-Stop Jurnal
    const totalKredit = tagihan.rincian.registrasi + tagihan.rincian.tindakan + tagihan.rincian.obat + tagihan.rincian.lab + tagihan.rincian.kamar + tagihan.rincian.operasi;
    if (tagihan.grandTotal !== totalKredit) {
      throw new Error('Jurnal tidak balance. Transaksi dibatalkan.');
    }

    const kembalian = nominal_bayar - tagihan.grandTotal;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const tgl = new Date();

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        // -- A. GENERATE NO NOTA (OPTIMISTIC READ) --
        const prefixNota = `RJ${dateStr}`;
        const lastNota = await this.prisma.nota_jalan.findFirst({
          where: { no_nota: { startsWith: prefixNota } },
          orderBy: { no_nota: 'desc' },
        });
        
        let urutNota = 1;
        if (lastNota && lastNota.no_nota) {
          const lastSeq = parseInt(lastNota.no_nota.slice(-3));
          if (!isNaN(lastSeq)) urutNota = lastSeq + 1;
        }
        const noNota = `${prefixNota}${urutNota.toString().padStart(3, '0')}`;

        // -- B. GENERATE NO JURNAL (OPTIMISTIC READ) --
        const dateStrJurnal = dateStr.substring(2);
        const prefixJurnal = `J${dateStrJurnal}`;
        const lastJurnal = await this.prisma.jurnal.findFirst({
          where: { no_jurnal: { startsWith: prefixJurnal } },
          orderBy: { no_jurnal: 'desc' },
        });
        
        let urutJurnal = 1;
        if (lastJurnal && lastJurnal.no_jurnal) {
          const lastSeq = parseInt(lastJurnal.no_jurnal.slice(-4));
          if (!isNaN(lastSeq)) urutJurnal = lastSeq + 1;
        }
        const noJurnal = `${prefixJurnal}${urutJurnal.toString().padStart(4, '0')}`;

        // -- C. SIMPAN DATA TRANSAKSI DALAM 1 BATCH TRANSACTION --
        await this.prisma.$transaction(async (tx) => {
          await tx.nota_jalan.create({
            data: { no_rawat, no_nota: noNota, tanggal: tgl, jam: tgl },
          });

          await tx.reg_periksa.update({
            where: { no_rawat },
            data: { status_bayar: 'Sudah_Bayar' },
          });

          await tx.rawat_jl_dr.updateMany({
            where: { no_rawat },
            data: { stts_bayar: 'Sudah' },
          });

          if (tagihan.grandTotal > 0) {
            // Jurnal Header
            await tx.jurnal.create({
              data: {
                no_jurnal: noJurnal,
                no_bukti: noNota,
                tgl_jurnal: tgl,
                jam_jurnal: tgl,
                jenis: 'U',
                keterangan: `Pembayaran Pasien Rawat Jalan ${tagihan.pasien} (${no_rawat})`,
              }
            });

            // Debit KAS KASIR (111010)
            await tx.detailjurnal.create({
              data: { no_jurnal: noJurnal, kd_rek: '111010', debet: tagihan.grandTotal, kredit: 0 }
            });

            // Kredit Registrasi
            if (tagihan.rincian.registrasi > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420101', debet: 0, kredit: tagihan.rincian.registrasi }
              });
            }
            
            // Kredit Tindakan
            if (tagihan.rincian.tindakan > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420100', debet: 0, kredit: tagihan.rincian.tindakan }
              });
            }

            // Kredit Obat
            if (tagihan.rincian.obat > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420108', debet: 0, kredit: tagihan.rincian.obat }
              });
            }

            // Kredit Lab
            if (tagihan.rincian.lab > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420109', debet: 0, kredit: tagihan.rincian.lab }
              });
            }

            // Kredit Kamar
            if (tagihan.rincian.kamar > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420102', debet: 0, kredit: tagihan.rincian.kamar }
              });
            }

            // Kredit Operasi
            if (tagihan.rincian.operasi > 0) {
              await tx.detailjurnal.create({
                data: { no_jurnal: noJurnal, kd_rek: '420104', debet: 0, kredit: tagihan.rincian.operasi }
              });
            }
          }
        }); // End Transaction

        // Jika berhasil tanpa throw error, return hasilnya
        return {
          success: true,
          no_nota: noNota,
          total: tagihan.grandTotal,
          dibayar: nominal_bayar,
          kembalian,
        };

      } catch (error: any) {
        // Prisma Unique Constraint Violation is P2002
        if (error.code === 'P2002' && attempt < maxRetries) {
          console.warn(`[Kasir] Duplicate Unique Key detected on nota/jurnal. Retrying (${attempt}/${maxRetries})...`);
          continue;
        }
        // Jika error lain atau jatah retry habis, lemparkan error ke user
        throw error;
      }
    }
  }
}
