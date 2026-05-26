# Catatan Pembaharuan (Changelog)

Semua perubahan dan penambahan fitur yang dilakukan pada proyek simulasi SIMRS.

## [v1.1.0] - Pembaruan Simulasi & Dasbor Monitoring
**Tanggal:** 27 Mei 2026

### 🚀 Fitur Baru (New Features)
- **Data Monitoring Dashboard (`simrs-frontend`):**
  - Menambahkan halaman dasbor baru khusus untuk pemantauan data pasien secara *real-time*.
  - Menampilkan metrik utama seperti total pasien, pasien rawat jalan, rawat inap, dan IGD.
  - Tabel interaktif untuk *browse* seluruh data pasien dengan status penanganan.
  - Integrasi UI menggunakan estetika modern.
- **Auto-Seeding Master Data (`simulation`):**
  - Otomatisasi pengisian tabel referensi utama (contoh: `template_laboratorium`) sebelum skrip generator berjalan, memastikan relasi data tidak ada yang kosong.

### 🐛 Perbaikan Bug (Bug Fixes)
- **Foreign Key Constraints:**
  - Memperbaiki kegagalan relasi pada `detail_periksa_lab` dengan memastikan `id_template` memetakan data dengan benar ke master data lab.
- **Data Truncation Error (Enum):**
  - Menyesuaikan nilai kategori tindakan pada tabel `operasi` agar sesuai dengan batasan *Enum* pada database (misalnya mengubah `'Sedang'` menjadi `'Sedang Cito'`).
- **Penanganan Variabel Python (UnboundLocalError):**
  - Menginisialisasi variabel mutasi stok dan resep di awal *loop* untuk mencegah terhentinya skrip ketika pasien tidak menerima resep obat.
- **Validasi Data Bangsal:**
  - Memperbaiki pengisian kamar inap pasien sehingga tidak lagi menggunakan kode *default* `'-'` yang ditolak oleh sistem.

### 🔧 Peningkatan (Enhancements)
- **Data Ingestion 500 Pasien:**
  - Skrip generasi data telah dioptimalkan untuk memproses 500 entri pasien dengan berbagai kondisi dan variasi (tanpa error).
  - Skrip kini dipastikan mengisi setiap kolom yang dulunya bernilai `NULL` (seperti data vital, rincian biaya, KSO, manajemen, mutasi stok, dll) menjadi data *dummy* yang relevan dan lengkap.
