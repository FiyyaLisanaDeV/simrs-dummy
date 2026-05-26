import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FarmasiService {
  constructor(private prisma: PrismaService) {}

  async searchObat(keyword: string) {
    return this.prisma.databarang.findMany({
      where: {
        status: '1',
        nama_brng: {
          contains: keyword,
        },
      },
      select: {
        kode_brng: true,
        nama_brng: true,
        ralan: true,
      },
      take: 20,
    });
  }

  async getStokGudang(kode_brng: string) {
    return this.prisma.gudangbarang.findMany({
      where: {
        kode_brng,
      },
      select: {
        kd_bangsal: true,
        stok: true,
      },
    });
  }

  async getMetodeRacik() {
    return this.prisma.metode_racik.findMany();
  }

  async createResep(data: { 
    no_rawat: string; 
    kd_dokter: string; 
    items: { kode_brng: string; jml: number; aturan: string }[];
    racikan?: {
      nama_racik: string;
      kd_racik: string;
      jml_dr: number;
      aturan_pakai: string;
      keterangan: string;
      details: { kode_brng: string; p1: number; p2: number }[];
    }[];
  }) {
    const now = new Date();
    
    // Generate no_resep (YYYYMMDDxxxx)
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const prefix = `${yyyy}${mm}${dd}`;
    
    const lastResep = await this.prisma.resep_obat.findFirst({
      where: {
        no_resep: { startsWith: prefix }
      },
      orderBy: { no_resep: 'desc' }
    });
    
    let urut = 1;
    if (lastResep && lastResep.no_resep.length === 12) {
      urut = parseInt(lastResep.no_resep.slice(8)) + 1;
    }
    const no_resep = `${prefix}${String(urut).padStart(4, '0')}`;
    
    const resep = await this.prisma.resep_obat.create({
      data: {
        no_resep,
        tgl_perawatan: now,
        jam: now,
        no_rawat: data.no_rawat,
        kd_dokter: data.kd_dokter,
        tgl_peresepan: now,
        jam_peresepan: now,
        status: 'ralan',
        tgl_penyerahan: new Date('1970-01-01T00:00:00.000Z'),
        jam_penyerahan: new Date('1970-01-01T00:00:00.000Z'),
        resep_dokter: data.items && data.items.length > 0 ? {
          create: data.items.map((item) => ({
            kode_brng: item.kode_brng,
            jml: item.jml,
            aturan_pakai: item.aturan,
          })),
        } : undefined,
        resep_dokter_racikan: data.racikan && data.racikan.length > 0 ? {
          create: data.racikan.map((r, index) => ({
            no_racik: String(index + 1),
            nama_racik: r.nama_racik,
            kd_racik: r.kd_racik,
            jml_dr: r.jml_dr,
            aturan_pakai: r.aturan_pakai,
            keterangan: r.keterangan,
            resep_dokter_racikan_detail: {
              create: r.details.map((d) => ({
                kode_brng: d.kode_brng,
                p1: d.p1,
                p2: d.p2,
                kandungan: '250mg',
                jml: (d.p1 / d.p2) * r.jml_dr
              }))
            }
          }))
        } : undefined
      },
      include: {
        resep_dokter: {
          include: { databarang: true }
        },
        resep_dokter_racikan: {
          include: {
            resep_dokter_racikan_detail: {
              include: { databarang: true }
            }
          }
        }
      },
    });

    return resep;
  }

  async getAntreanResep() {
    return this.prisma.resep_obat.findMany({
      where: {
        tgl_penyerahan: new Date('1970-01-01T00:00:00.000Z')
      },
      include: {
        dokter: true,
        reg_periksa: {
          include: { pasien: true }
        },
        resep_dokter: {
          include: { databarang: true }
        }
      },
      orderBy: { tgl_peresepan: 'asc' }
    });
  }

  async validasiResep(no_resep: string) {
    const BANGSAL_APOTEK = process.env.DEFAULT_APOTEK_RAWAT_JALAN_KODE_BANGSAL;
    if (!BANGSAL_APOTEK) {
      throw new Error('Kode gudang apotek rawat jalan belum dikonfigurasi.');
    }
    
    const resep = await this.prisma.resep_obat.findUnique({
      where: { no_resep },
      include: {
        resep_dokter: {
          include: { databarang: true }
        }
      }
    });

    if (!resep) throw new Error('Resep tidak ditemukan');
    if (resep.tgl_penyerahan!.getFullYear() !== 1970) {
      throw new Error('Resep sudah divalidasi dan diserahkan');
    }

    const items = resep.resep_dokter;
    const rincianBiaya = [];
    let totalTagihan = 0;
    const minusStockItems = [];

    // Cek stok secara informatif dan hitung estimasi harga
    for (const item of items) {
      const itemJml = item.jml || 0;
      const stokObatList = await this.prisma.gudangbarang.findMany({
        where: { kode_brng: item.kode_brng, kd_bangsal: BANGSAL_APOTEK }
      });
      
      const totalStok = stokObatList.reduce((sum, g) => sum + g.stok, 0);
      
      if (totalStok < itemJml) {
        minusStockItems.push({
          nama: item.databarang.nama_brng,
          dibutuhkan: itemJml,
          tersedia: totalStok
        });
      }

      const harga = item.databarang.ralan || 0;
      const embalase = 1000; // Contoh tarif
      const tuslah = 500;    // Contoh tarif
      const total = (harga * itemJml) + embalase + tuslah;
      totalTagihan += total;

      rincianBiaya.push({
        nama: item.databarang.nama_brng,
        jml: itemJml,
        harga,
        embalase,
        tuslah,
        total,
        stok_cukup: totalStok >= itemJml
      });
    }

    return {
      success: true,
      status: minusStockItems.length > 0 ? 'STOK_KURANG' : 'SIAP_PROSES',
      kekurangan_stok: minusStockItems,
      rincian: rincianBiaya,
      total_estimasi: totalTagihan,
      pesan: minusStockItems.length > 0 ? 'Resep tidak bisa diproses karena stok kurang.' : 'Resep siap diserahkan.'
    };
  }

  async serahkanObat(no_resep: string, kd_bangsal_asal?: string) {
    // Pendekatan Depo Resolver:
    // 1. Apoteker memilih dari dropdown (via payload kd_bangsal_asal)
    // 2. Jika tidak ada, di production seharusnya ambil dari mapping user.
    // Saat ini, jika tidak disupply, blokir.
    const BANGSAL_APOTEK = kd_bangsal_asal;
    if (!BANGSAL_APOTEK) {
      throw new Error('Depo asal belum ditentukan. Pilih depo/bangsal asal sebelum menyerahkan obat.');
    }
    
    const resep = await this.prisma.resep_obat.findUnique({
      where: { no_resep },
      include: {
        resep_dokter: {
          include: { databarang: true }
        }
      }
    });

    if (!resep) throw new Error('Resep tidak ditemukan');
    if (resep.tgl_penyerahan!.getFullYear() !== 1970) {
      throw new Error('Resep sudah diserahkan');
    }

    const items = resep.resep_dokter;
    const now = new Date();
    
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const itemJml = item.jml || 0;
        
        // 1. Lock tabel stok
        const stokObatList = await tx.$queryRaw<any[]>`SELECT * FROM gudangbarang WHERE kode_brng = ${item.kode_brng} AND kd_bangsal = ${BANGSAL_APOTEK} ORDER BY no_faktur ASC FOR UPDATE`;
        
        // 2. Cek fisik
        const totalStok = stokObatList.reduce((sum, g) => sum + g.stok, 0);
        if (totalStok < itemJml) {
          throw new Error('400 Insufficient Stock: Obat ' + item.databarang.nama_brng + ' tidak mencukupi.');
        }

        // 3. Potong stok fisik gudangbarang & catat riwayat
        let remainingToCut = itemJml;
        for (const g of stokObatList) {
          if (remainingToCut <= 0) break;
          const cutAmount = Math.min(g.stok, remainingToCut);
          if (cutAmount > 0) {
             await tx.$executeRaw`UPDATE gudangbarang SET stok = stok - ${cutAmount} WHERE kode_brng = ${g.kode_brng} AND kd_bangsal = ${g.kd_bangsal} AND no_batch = ${g.no_batch} AND no_faktur = ${g.no_faktur}`;
             
             // Insert log riwayat mutasi
             await tx.riwayat_barang_medis.create({
               data: {
                 kode_brng: g.kode_brng,
                 stok_awal: g.stok,
                 masuk: 0,
                 keluar: cutAmount,
                 stok_akhir: g.stok - cutAmount,
                 posisi: 'Penyerahan Resep',
                 tanggal: now,
                 jam: now,
                 petugas: 'System', // Nanti diganti user aktif JWT
                 kd_bangsal: g.kd_bangsal,
                 status: 'Simpan',
                 no_batch: g.no_batch,
                 no_faktur: g.no_faktur,
                 keterangan: 'Penyerahan Obat Rawat Jalan'
               }
             });
             remainingToCut -= cutAmount;
          }
        }

        // 4. Masukkan ke detail_pemberian_obat (Tagihan Final + Tuslah + Embalase)
        const harga = item.databarang.ralan || 0;
        const embalase = 1000;
        const tuslah = 500;
        await tx.detail_pemberian_obat.create({
          data: {
            tgl_perawatan: now,
            jam: now,
            no_rawat: resep.no_rawat,
            kode_brng: item.kode_brng,
            h_beli: harga * 0.8,
            biaya_obat: harga,
            jml: itemJml,
            embalase: embalase,
            tuslah: tuslah,
            total: (harga * itemJml) + embalase + tuslah,
            status: 'Ralan',
            kd_bangsal: BANGSAL_APOTEK,
            no_batch: '-', // default
            no_faktur: '-'
          }
        });
      }

      // 5. Update status Resep Obat
      await tx.resep_obat.update({
        where: { no_resep },
        data: {
          tgl_penyerahan: now,
          jam_penyerahan: now
        }
      });
    });

    return { success: true, message: 'Obat berhasil diserahkan dan tagihan diterbitkan.' };
  }
}
