# DECISION_LOG.md — Catatan Keputusan Teknis SIMRS-Web

Dokumen ini mencatat setiap keputusan krusial (Arsitektur, Logika Bisnis, Keamanan) agar pengembang berikutnya tidak mengulang debat yang sama atau membatalkan keputusan yang sudah disepakati.

---

## 2026-05-26 — Pembekuan Fitur Baru & Fokus Refaktor Inti (Debt Eradication)

### Konteks
Dokumen proyek sebelumnya mengklaim bahwa fase-fase fitur (Kasir, Pendaftaran, Lab, Ranap) telah "Sukses & Selesai", padahal secara teknis *backend* belum memiliki mekanisme *concurrency locking* untuk kasir, pengurangan stok fisik `gudangbarang`, dan *RBAC Guard* keamanan.

### Keputusan
Membekukan sementara seluruh roadmap pengembangan fitur baru (seperti Modul HRD, Gizi, Modul Keuangan Lanjutan) dan mengalihkan 100% *resource* untuk membenahi "Hutang Teknis Mematikan" pada Modul Kasir, Farmasi, dan Security.

### Alasan
Melanjutkan ekspansi UI/Fitur di atas fondasi *backend* yang rentan (*no RBAC*, *race condition*) akan berujung pada kerusakan data fatal (*database corruption*) ketika sistem menyentuh environment *Production* dengan beban *multi-user*. 

### Dampak
Roadmap Fase 8 dan 9 ditunda. Prioritas dialihkan ke Refaktor Kasir (Nota Locking) & Refaktor Farmasi (Stok Fisik).

### Risiko
Keterlambatan rilis fitur-fitur baru ke *end-user*, namun *trade-off* ini wajib demi menyelamatkan keselamatan data medis dan operasional RS.

### Status
**Aktif**

---

## 2026-05-26 — Kebijakan "Zero-Modification" Terhadap Struktur DB SIMRS Dummy

### Konteks
Sistem legacy SIMRS Dummy (*Java Desktop*) masih digunakan dan merupakan sumber kebenaran tunggal untuk laporan rumah sakit dan klaim BPJS. 

### Keputusan
Dilarang keras melakukan `ALTER TABLE` pada tabel bawaan SIMRS Dummy (menambah kolom baru, merubah tipe data, mengubah konvensi relasi). Dilarang merubah konvensi ID asli (seperti `no_rawat`, `no_nota` yang berformat sequence waktu).

### Alasan
Perubahan struktur atau konvensi di SIMRS-Web akan langsung merusak aplikasi Java SIMRS Dummy Desktop (Error SQL) dan menggagalkan ekspor laporan klaim ke server Kementerian/BPJS.

### Dampak
Pengembangan fitur tambahan SIMRS-Web yang membutuhkan metadata baru harus menggunakan metode "Tabel Ekstensi" (*Sidecar Table*) dengan skema terpisah, bukan numpang di tabel asli.

### Risiko
Sinkronisasi antar tabel ekstensi dan tabel asli butuh *effort* *join* tambahan.

### Status
**Aktif**

## 2026-05-26 — Pengamanan Nomor Nota Kasir dengan Sequence Tracker

### Konteks
Modul kasir berisiko mengalami duplicate no_nota ketika dua kasir melakukan pembayaran secara bersamaan.

### Keputusan
Membuat tabel ekstensi simrs_web_sequence_tracker untuk mengamankan nomor urut kasir dengan SELECT ... FOR UPDATE di dalam database transaction.

### Alasan
Retry-only tidak cukup aman untuk transaksi keuangan. Pessimistic locking memberikan determinisme dan mencegah collision pada nomor nota.

### Dampak
Terdampak pada modul kasir, nota_jalan, jurnal, detailjurnal, dan status_bayar.

### Risiko Tersisa
Deadlock masih mungkin terjadi pada traffic tinggi, sehingga perlu retry terbatas untuk kasus deadlock.

### Status
Aktif.

## 2026-05-26 — Kode Gudang Farmasi Rawat Jalan Harus Berbasis Konfigurasi

### Konteks
Kode gudang/apotek rawat jalan bisa berbeda antar instalasi SIMRS Dummy. Hardcode B0001 berisiko memotong stok dari gudang yang salah.

### Keputusan
Tidak melakukan hardcode kode gudang. Gunakan konfigurasi DEFAULT_APOTEK_RAWAT_JALAN_KODE_BANGSAL.

### Alasan
Menjaga akurasi stok, HPP, riwayat mutasi, dan kompatibilitas dengan Java SIMRS Dummy.

### Dampak
Terdampak pada modul farmasi, gudangbarang, riwayat_barang_medis, billing, tuslah, dan embalase.

### Risiko Tersisa
Fitur serah obat akan terblokir sampai kode gudang dikonfirmasi.

### Status
Aktif.

## 2026-05-26 — Pivot: Penggunaan Optimistic Concurrency pada Kasir

### Konteks
Setelah dievaluasi ulang, penerapan tabel ekstensi sequence untuk Kasir dirasa melanggar spirit asli "Zero-DDL". 

### Keputusan
Mengganti pendekatan Pessimistic Locking menjadi **Optimistic Concurrency + Retry on Duplicate Key**. 

### Alasan
Tabel `nota_jalan` dan `jurnal` memiliki UNIQUE/PRIMARY KEY pada `no_nota` dan `no_jurnal`. Saat terjadi bentrok *race condition*, MySQL akan melempar error *Duplicate Key* (P2002 di Prisma). Sistem menangkap error ini dan melakukan *retry* maksimal 5 kali.

### Dampak
Tabel ekstensi tidak lagi diperlukan. Transaksi tetap dalam lingkup yang aman, namun jika traffic sangat tinggi (misal 5 kasir bersamaan memproses), mungkin ada sedikit jeda karena *retry loop*.

### Status
Aktif.

## 2026-05-26 — Pivot: Penggunaan Depo Resolver untuk Farmasi

### Konteks
Hardcode `B0001` via config ENV ternyata tidak fleksibel untuk RS yang memiliki lebih dari satu depo (misal: Depo IGD, Depo OK, Depo Ranap).

### Keputusan
Memisahkan validasi dan penyerahan obat, serta menggunakan **Depo Resolver**. Pada endpoint `/farmasi/serahkan`, parameter `kd_bangsal_asal` wajib dikirim (dipilih oleh Apoteker via antarmuka / mapping user login).

### Alasan
Mencegah salah potong gudang saat sistem dipakai lintas departemen.

### Status
Aktif.

---

## 2026-05-26 — Refaktor Prioritas 2: Keputusan Operasional Keamanan & Audit

### 1. Hybrid RBAC & Endpoint Security
**Keputusan:** Gunakan Hybrid RBAC. *Identity* diambil dari data pegawai SIMRS Dummy, *Permission* dari `hak_akses` SIMRS Dummy, lalu disederhanakan melalui *Role-Mapping Internal* di aplikasi Web. JWT menyimpan snapshot, namun **semua endpoint write wajib dilindungi backend guard** (menolak 403 jika akses ditolak).

### 2. BPJS / Bridging VClaim
**Keputusan:** Untuk fase saat ini, SIMRS-Web **tidak** melakukan bridging BPJS riil. Aplikasi hanya bertugas **membaca SEP existing** dari `bridging_sep`. Jika pasien BPJS belum punya SEP, blokir prosesnya. Pembuatan SEP riil ditunda (Deferred) ke fase selanjutnya, tetapi Mock BPJS Adapter disetujui untuk persiapan.

### 3. No Silent Failure & Audit Trail
**Keputusan:** Dibuat tabel ekstensi khusus **`simrs_web_audit_trail`**. Semua *action* penting (Kasir, Farmasi, CPPT, Rekam Medis, BPJS, Login) wajib masuk ke tabel ini beserta payload JSON sebelum dan sesudahnya. File log berbasis text (Pino/Winston) tetap ada tapi hanya untuk debugging teknis, tidak cukup untuk level rumah sakit.

### 4. Real-time / WebSocket
**Keputusan:** Penggunaan WebSocket / Redis PubSub **ditunda** (Deferred). Aplikasi akan mengandalkan mekanisme *controlled polling* ringan (10-30 detik) dan *manual refresh*. Fitur *real-time* besar baru akan dibangun setelah kasir, stok, RBAC, dan audit stabil.
