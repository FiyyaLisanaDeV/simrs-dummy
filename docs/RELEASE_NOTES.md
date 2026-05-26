# RELEASE_NOTES.md

Catatan perubahan (Changelog) untuk rilis SIMRS-Web (Aladin).

---

## [0.1.0-alpha] - 2026-05-26
Status: **UNSTABLE / PROTOTYPE**

### 🚀 Fitur Baru (Belum Disertifikasi Production)
- **Modul Pendaftaran (FO)**: Mendukung registrasi Poli & IGD. Pembuatan nomor `no_rawat` format baru terintegrasi.
- **Modul Poliklinik (RME)**: Dokter dapat menginput *Subjective, Objective, Assessment, Plan* (SOAP) di `pemeriksaan_ralan`.
- **Modul Laboratorium**: *Dashboard* petugas Lab, penambahan biaya uji lab otomatis.
- **Modul Rawat Inap & Bed Management**: Penarikan ketersediaan tempat tidur Inap, form pengisian CPPT TTV Harian (`pemeriksaan_ranap`).
- **Modul Kasir & Billing**: 
  - Penarikan kumulatif biaya (Registrasi + Tindakan Dr + Obat + Lab + Inap + Operasi).
  - *Auto-posting* Nota Jalan & Jurnal Akuntansi (*Prototype*).
- **Modul Kamar Operasi (OK)**: Integrasi dengan Master Paket Operasi untuk membagi insentif (Operator, Anestesi, Omloop, dsb).

### ⚠️ Known Issues / Technical Debt Terindentifikasi
- **Sistem Keamanan Terbuka**: Belum ada enkripsi *Guard* RBAC di Backend (API bisa *di-hit* publik secara *bypass*).
- **Race Condition Billing Kasir**: Pembuatan Nota belum dilindungi oleh skema kunci transaksi (*Pessimistic Lock*). Menimbulkan potensi ID tabrakan.
- **Stok Farmasi Cacat**: Modul tidak terkoneksi ke gudang barang untuk pengeluaran fisik HPP stok. 

### 🔧 Rencana Rilis Berikutnya (Fokus Refaktor)
- Implementasi Sequence Locking / Pessimistic Locking untuk Kasir.
- Pembuatan NestJS JWT Guard & Roles Guard berdasarkan konfigurasi `user` tabel SIMRS Dummy.
- Refaktor modul Logika Pemotongan Fisik Stok Farmasi (`gudangbarang` & `riwayat_barang_medis`).
