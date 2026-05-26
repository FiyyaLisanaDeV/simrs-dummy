# RISK_REGISTER.md — Pendaftaran Risiko SIMRS-Web

Dokumen ini memantau risiko sistem berdasarkan dampak (Impact), kemungkinan terjadi (Likelihood), tingkat keparahan (Level), dan status mitigasi.

| ID | Risiko | Dampak | Kemungkinan | Level | Mitigasi | Status |
|:---|:---|:---:|:---:|:---|:---|:---|
| **RSK-01** | **Duplicate/Collision `no_nota` & `no_jurnal`**<br>Dua kasir menekan tombol bayar bersamaan menghasilkan nomor yang sama. | Tinggi | Sedang | **Kritis** | Implementasi fungsi *generator* sequence tersendiri dengan Pessimistic Locking (`SELECT ... FOR UPDATE` via raw query atau Prisma `$transaction` dengan level Isolasi yang ketat). | 🔴 Open |
| **RSK-02** | **Stok Obat Fisik Tidak Terpotong (`gudangbarang`)**<br>Sistem saat ini hanya melayani resep, tetapi belum melakukan pengurangan stok fisik & HPP. | Tinggi | Sangat Tinggi | **Kritis** | Refaktor arsitektur API Farmasi untuk memotong `stok` di `gudangbarang` dan menyisipkan *log* ke `riwayat_barang_medis` sesuai kaidah LIFO/FIFO saat serah terima. | 🔴 Open |
| **RSK-03** | **Tidak Ada Guard RBAC & JWT di API**<br>Data Rekam Medis (CPPT) dapat diakses, diedit, atau dihapus oleh anonymous/user tanpa hak. | Tinggi | Tinggi | **Kritis** | Menerapkan `AuthGuard` dan `RoleGuard` di NestJS, mencocokkan *token* dengan tabel `user` SIMRS Dummy asli. Validasi per *endpoint*. | 🔴 Open |
| **RSK-04** | **Tidak Ada Audit Trail (Log Perubahan)**<br>Perubahan kritis (misal: Batal bayar, edit CPPT, hapus diagnosa) tidak terlacak pelakunya. | Sedang | Tinggi | **Tinggi** | Menerapkan modul *Interceptor* atau merekam ke tabel log spesifik setiap aksi mutasi data (*write*). | 🔴 Open |
| **RSK-05** | **Ketiadaan Validasi Fisik Obat (Minus)**<br>Apoteker dapat memvalidasi resep melebihi stok yang ada di gudang. | Tinggi | Sedang | **Tinggi** | Blokir validasi jika sisa stok < permintaan, kecuali ada *override authorization* yang dicatat (Audit). | 🔴 Open |
| **RSK-06** | **Kegagalan Pembuatan SEP (BPJS)**<br>Pasien BPJS lolos daftar tapi SEP gagal di-*generate*. Klaim RS akan hangus. | Tinggi | Tinggi | **Kritis** | Terapkan *Mock API* dan validasi sinkron. Jika SEP gagal terbit, *rollback* pendaftaran atau tandai sebagai "Tunda SEP". | 🔴 Open |

*Risk Register akan diperbarui seiring berjalannya iterasi perbaikan (Refaktor).*

## Tambahan Risiko Pivot (26 Mei 2026)

| Risiko | Dampak | Kemungkinan | Level | Mitigasi | Status |
|---|---:|---:|---|---|---|
| Timeout/Deadlock karena Optimistic Retry berlebihan saat traffic meledak | Tinggi | Rendah | Tinggi | Batasi maksimal retry (saat ini 5 kali). Jika gagal, kembalikan respon error eksplisit ke UI agar kasir bisa klik bayar ulang secara manual. | Open |
| Serah obat gagal karena Depo Resolver tidak disediakan oleh UI Frontend | Tinggi | Sedang | Kritis | Validasi wajib `kd_bangsal_asal` di level API. Tanpanya proses otomatis terblokir (tidak akan salah potong). | Open |
