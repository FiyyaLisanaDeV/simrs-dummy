# PRODUCTION_READINESS_CHECKLIST.md

Daftar prasyarat absolut sebelum *source code* SIMRS-Web (Aladin) ini dizinkan di-*deploy* ke server *Production* Rumah Sakit (Live Server).

## A. Arsitektur & Keamanan (Security)
- [ ] Otorisasi berbasis RBAC (Role-Based Access Control) telah aktif di setiap *endpoint* API (Backend Guard).
- [ ] Otorisasi *Frontend* telah diimplementasi (Penyembunyian menu + Pencegahan akses routing via URL).
- [ ] *Credential Database, API Key BPJS, JWT Secret* tidak *hardcoded* dan dimasukkan via `.env`.
- [ ] Database *Production* dan *Staging* telah dipisah secara fisik/logical.
- [ ] Tidak ada pencetakan Data Medis sensitif (`console.log`, Error *stack trace* 500) yang bocor ke klien.

## B. Integritas Keuangan & Jurnal (Billing)
- [ ] Mekanisme *Anti-Collision* (Pessimistic/Optimistic Lock) untuk *sequence* nomor nota, jurnal, dan rekam medis dipastikan bekerja (Uji Concurrency).
- [ ] Nilai Total Debit dan Total Kredit pada Jurnal dipastikan 100% *Balance*.
- [ ] Piutang dan Deposit (Uang Muka) sudah bisa dilacak dan dikalkulasi akurat.

## C. Manajemen Inventori & Farmasi
- [ ] Pengurangan fisik barang (`gudangbarang`) telah diuji silang dan diverifikasi oleh Apoteker.
- [ ] Mutasi masuk/keluar wajib menghasilkan *log* di `riwayat_barang_medis`.
- [ ] Tuslah (Biaya Resep) dan Embalase (Biaya Bungkus/Kemasan) berhasil masuk secara wajar di *billing* pasien.

## D. Kepatuhan BPJS (Compliance)
- [ ] *Bridging* penerbitan nomor SEP sudah berhasil dengan *Credential Production* BPJS.
- [ ] Input CPPT dan Diagnosa secara tegas menggunakan format *ICD-10* dan *ICD-9CM* yang tersinkronisasi.
- [ ] Validasi *Task ID* antrean (Mobile JKN) telah tersambung (WIP).

## E. Kompatibilitas Sistem Legacy (Java SIMRS Dummy)
- [ ] Nomor Rawat yang dihasilkan via WEB bisa dipanggil dan dimanipulasi dengan lancar dari Java SIMRS Dummy (Tidak ada tabel yang dikunci/digantung).
- [ ] Nota/Kwitansi tagihan (WEB vs JAVA) menghasilkan digit Rupiah yang identik.

## F. Kesiapan Operasional 
- [ ] Rencana Rollback Database dan *Source Code* (*Rollback Plan*) tersedia.
- [ ] Modul diaktifkan secara bertahap (Misal: Baca Dulu -> Coba Pendaftaran -> Coba Poliklinik). 
- [ ] Ketersediaan Audit Trail (Pelacakan siapa *user* yang merubah rekam medis atau membatalkan nota).
