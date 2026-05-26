# CURRENT_STATE.md — Status Kebenaran Terkini SIMRS-Web

## 1. Ringkasan Status
Proyek SIMRS-Web saat ini telah berhasil menyambungkan UI modern (React/Vite) dengan backend (NestJS/Prisma) yang melakukan *read/write* ke database asli SIMRS Dummy secara *symbiosis*. Namun, status penyelesaian yang pernah dicatat pada dokumentasi fase awal **bersifat prototype fungsional (Happy Path)**. Sistem **BELUM LAYAK PRODUCTION** karena mengabaikan pengamanan konkurensi (race condition), validasi ketat inventori farmasi, dan lapisan keamanan RBAC (Role-Based Access Control).

## 2. Modul Stabil
*Belum ada modul yang 100% stabil untuk level Production rumah sakit.*
Modul yang paling mendekati stabil (namun masih butuh refaktor audit/RBAC) adalah:
- **Pendaftaran (Front Office)**: Read/Write ke `reg_periksa` dan `pasien` sudah sesuai format `YYYY/MM/DD/xxxxxx`.
- **Bed Management (Read-Only)**: Penarikan data *Bed Availability* dari tabel `kamar`.

## 3. Modul Prototype (Tampil & Sebagian Berjalan, Belum Aman Production)
- **Rekam Medis (Ralan & Ranap)**: Form CPPT/SOAP sudah tersimpan di tabel `pemeriksaan_ralan` dan `pemeriksaan_ranap`. Namun, integrasi *mandatory* ICD-10 ke tabel `diagnosa_pasien` belum divalidasi secara ketat. Tidak ada *audit trail* siapa yang mengedit/menghapus rekam medis.
- **Laboratorium**: Pemesanan lab dan *billing* lab sudah tersambung.
- **Kamar Operasi (OK)**: Form bedah sudah mengirim tagihan ke kasir dan memanggil `paket_operasi`.
- **Kasir & Keuangan**:
  - ✔️ Sudah menghasilkan `nota_jalan`, `jurnal`, dan `detailjurnal`.
  - ✔️ Total Debit = Total Kredit.
  - ❌ **RISIKO TINGGI**: Pembuatan `no_nota` dan `no_jurnal` menggunakan metode *read-and-increment* (`findFirst`) tanpa *database lock* (pessimistic locking/sequence), sehingga berisiko tinggi terjadi *collision* ganda jika 2 kasir klik bayar bersamaan.
  - ❌ Belum menangani piutang, refund, dan pembatalan transaksi.

## 4. Modul Belum Aman Production (Sangat Berisiko / Dummy)
- **Farmasi & Inventori**: Modul Farmasi saat ini belum menyentuh inti dari manajemen stok. Pengurangan `gudangbarang`, pencatatan `riwayat_barang_medis`, perhitungan FIFO/LIFO, serta kalkulasi harga tuslah dan embalase **belum diimplementasikan**. Menjalankan ini di production akan merusak neraca stok obat rumah sakit.
- **BPJS & Klaim**: Belum ada integrasi *bridging* V-Claim (SEP). Pendaftaran BPJS di sistem saat ini hanya sebatas menyimpan *string* Penjab tanpa menerbitkan nomor SEP resmi dari server BPJS.

## 5. Hutang Teknis Aktif (Technical Debt)
- **RBAC (Role-Based Access Control) Absen**: Backend tidak memiliki *guards*. Semua *endpoint* terbuka secara publik tanpa validasi token JWT yang dicocokkan dengan tabel hak akses SIMRS Dummy (`user`).
- **Audit Trail Absen**: Tidak ada log riwayat perubahan data krusial (siapa merubah resep, siapa menghapus billing).
- **Concurrency Issue**: `no_nota`, `no_resep`, dan `no_jurnal` rawan duplikat pada lingkungan multi-user.
- **Performance**: Beberapa *dropdown* (seperti pencarian pasien/obat) belum menggunakan *server-side pagination* yang dilimit.

## 6. Kontradiksi Dokumen
- **Dokumentasi Fase Awal vs Kenyataan**: Dokumen sebelumnya mengklaim "sistem siap dites di staging/production" dan "Fase selesai sukses". Ini **berkontradiksi** dengan kenyataan bahwa sistem tidak memiliki pengamanan RBAC dan rawan *race-condition*.
  - *Resolusi*: Semua klaim "Selesai" di dokumen lama di-downgrade menjadi "Selesai secara Prototype UI/Logic Dasar".

## 7. Risiko Kritis (Berdasarkan Urutan Paling Berbahaya)
1. **Risiko Keuangan (Collision Tagihan & Jurnal)**: Duplikasi nomor nota/jurnal akibat ketiadaan *locking* transaksi.
2. **Risiko Inventori Farmasi Berantakan**: Obat keluar namun stok `gudangbarang` tidak terpotong dengan akurat sesuai riwayat medis.
3. **Risiko Keamanan Data Medis**: Tidak ada *Guard* RBAC di backend, data rekam medis dapat diakses atau diubah oleh *user* mana pun jika URL *endpoint* diketahui.
4. **Risiko Penolakan Klaim BPJS**: Ketiadaan integrasi SEP.

## 8. Prioritas Eksekusi Berikutnya (Refaktor Risiko)
- **Prioritas 1 (Keuangan & Inventori)**: Memperbaiki sistem *Auto-Numbering* Kasir dengan Transaction Locking (Pessimistic Lock) di Prisma, dan membangun modul write Farmasi yang sesungguhnya (memotong stok fisik, HPP, tuslah).
- **Prioritas 2 (Security & RBAC)**: Membangun mekanisme `AuthGuard` di NestJS yang memvalidasi otorisasi *request* ke tabel hak akses SIMRS Dummy.
- **Prioritas 3 (BPJS & ICD)**: Mewajibkan input diagnosa ICD-10 di RME dan membuat simulasi/Mock SEP BPJS.

## 9. Production Readiness Checklist
- [ ] Concurrency/Locking diterapkan pada *generator* Nota & Jurnal.
- [ ] Mutasi stok farmasi tersambung 100% ke `gudangbarang` dan `riwayat_barang_medis`.
- [ ] Semua endpoint backend dilindungi JWT & RBAC Guard.
- [ ] Bridging SEP V-Claim (Mock) berjalan.
- [ ] Audit trail aktif untuk transaksi finansial & medis.
- [ ] Lulus testing paralel dengan aplikasi Java SIMRS Dummy Desktop.
