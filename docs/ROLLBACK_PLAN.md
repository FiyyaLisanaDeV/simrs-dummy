# ROLLBACK_PLAN.md

Langkah mitigasi jika penerapan (*deployment*) SIMRS-Web di *Production* menyebabkan kerusakan data, macetnya operasional RS, atau *error* fatal.

## Kriteria Darurat Rollback
Rollback harus SEGERA dieksekusi jika salah satu kondisi ini terjadi:
1. Terjadi duplikasi nomor ID primer (`no_rawat`, `no_nota`, `no_resep`, `no_sep`).
2. Transaksi pembayaran tidak mencatat jurnal akuntansi atau nilai jurnal tidak seimbang (Debit ≠ Kredit).
3. Obat dan alkes keluar dari gudang secara bebas tanpa mengurangi neraca stok fisik secara *database*.
4. Kebocoran akses keamanan (Misal: User biasa bisa merubah tarif).
5. Kinerja Java SIMRS Dummy Desktop terhambat akibat penguncian tabel (*Table Deadlock*) oleh Web Backend.

## Prosedur Teknis Rollback (Software)
1. **Frontend & Backend Shutdown**:
   Hentikan proses *Node.js* (PM2 / Docker) SIMRS-Web secara seketika untuk memutus akses *Write* ke *database*.
   ```bash
   pm2 stop simrs-backend
   pm2 stop simrs-frontend
   ```
2. **Pengumuman Operasional**: IT RS segera menginstruksikan pengguna untuk beralih 100% menggunakan aplikasi Desktop Java SIMRS Dummy sebagai *fallback*.

## Prosedur Teknis Rollback (Data)
Karena tidak ada pengubahan struktur tabel (Zero DDL Modification Policy), **TIDAK PERLU** ada *schema downgrade* pada Prisma.
Namun, jika terdapat data "sampah" atau "cacat" (seperti nota ganda):
1. DB Admin mengisolasi waktu kejadian kerusakan.
2. Memeriksa tabel `jurnal`, `detailjurnal`, `nota_jalan`, `reg_periksa` pada rentang waktu insiden.
3. Melakukan eksekusi query *DELETE/UPDATE* korektif atau me-*restore database backup* *Point-in-Time* terdekat sebelum insiden.

## Pencegahan Sebelum Terjadi
1. Wajib **Backup Database Full** 1 jam sebelum aktivasi SIMRS-Web di level *Production*.
2. Simulasi di server *Staging* yang isinya merupakan *clone* (Replika) dari DB Production H-1.
