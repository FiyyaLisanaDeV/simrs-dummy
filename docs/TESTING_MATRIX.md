# TESTING_MATRIX.md — Matriks Pengujian SIMRS-Web

Setiap fitur yang diselesaikan wajib lolos pengujian *end-to-end* yang mensimulasikan alur operasional sesungguhnya di rumah sakit, bukan hanya pengujian per-komponen.

## Skenario Wajib (WIP)

| ID | Skenario Alur Kerja | Ekspektasi Hasil (Acceptance Criteria) | Status Terakhir | Catatan |
|:---|:---|:---|:---:|:---|
| **TS-01** | **Pasien Umum Rawat Jalan Selesai**<br>Dari pendaftaran poli -> diperiksa (CPPT) -> diberi resep -> bayar lunas di Kasir. | - `no_rawat` tercipta sesuai urutan.<br>- Nota & Jurnal kasir seimbang.<br>- Mutasi obat terekam.<br>- `status_bayar` = Lunas. | ❌ Belum Lulus | Concurrency kasir & potong stok belum terjamin. |
| **TS-02** | **Pasien BPJS Rawat Jalan Selesai**<br>Mirip TS-01 namun ditambah Bridging V-Claim SEP dan Diagnosa ICD-10. | - `no_sep` sukses terbit (Mock/Real).<br>- Ter-record di `bridging_sep`.<br>- Pengecekan limitasi obat kronis. | ❌ Belum Dimulai | Bridging SEP belum dikembangkan. |
| **TS-03** | **Farmasi Obat Tersedia (Validasi HPP)**<br>Dokter resepkan 10 Amoxicillin, Kasir minta bayar, Apotek serahkan obat. | - `gudangbarang` -10.<br>- `riwayat_barang_medis` tercatat Mutasi Keluar.<br>- Tagihan mencakup Tuslah/Embalase. | ❌ Belum Lulus | Logic pemotongan fisik gudang belum ada. |
| **TS-04** | **Farmasi Obat Racikan (P1/P2)**<br>Pembuatan pulveres racikan anak (misal: racik 1/2 tablet jadi 10 puyer). | - Pemotongan proporsional (0.5 tab per bungkus).<br>- Harga diakumulasi proporsional. | ❌ Belum Lulus | Belum diimplementasi. |
| **TS-05** | **Farmasi Kehabisan Stok**<br>Perawat meminta 5 Infus RL, namun stok fisik di sistem tinggal 2. | - UI memperingatkan Apoteker.<br>- Otorisasi *Supervisor* jika harus minus. | ❌ Belum Lulus | Blokir stok minus belum diimplementasi. |
| **TS-06** | **Pembayaran Parsial / Cicilan**<br>Total biaya Rp2 Juta, pasien baru sanggup bayar Rp1 Juta. | - Piutang pasien tercatat di jurnal.<br>- Status belum lunas. | ❌ Belum Dimulai | Belum diimplementasi. |
| **TS-07** | **Security Access RBAC (Cross-Role Attempt)**<br>User dengan role Kasir membuka URL halaman Farmasi atau RME. | - `403 Forbidden` di Frontend (redirect).<br>- `403 Forbidden` API dilempar oleh NestJS Guard. | ❌ Belum Lulus | Backend terbuka 100%. |
| **TS-08** | **Kasir Concurrency 10 TPS**<br>Simulasi 10 user memanggil `POST /kasir/bayar` serentak dalam milidetik yang sama. | - 0 Duplicate `no_nota`.<br>- 0 Duplicate `no_jurnal`. | ❌ Belum Lulus | API bayar belum dibekali pessimistic locking. |

## Skenario Refaktor Prioritas 1 (Kasir & Farmasi)

| ID | Skenario | Langkah Uji | Expected Result | Status |
|---|---|---|---|---|
| **TS-09** | Dua kasir bayar bersamaan | Jalankan dua transaksi pembayaran paralel | no_nota berbeda, jurnal balance, status_bayar benar | Pending |
| **TS-10** | Jurnal tidak balance | Simulasikan total debit tidak sama dengan kredit | Transaksi rollback, nota tidak dibuat | Pending |
| **TS-11** | Deadlock sequence | Simulasikan banyak transaksi kasir paralel | Retry terbatas berjalan, tidak ada duplicate no_nota | Pending |
| **TS-12** | Serah obat stok cukup | Serahkan obat dengan stok tersedia | gudangbarang berkurang, riwayat_barang_medis terisi | Pending |
| **TS-13** | Serah obat stok kurang | Serahkan obat melebihi stok | Error 400 Insufficient Stock, stok tidak berubah | Pending |
| **TS-14** | Config gudang kosong | Jalankan serah obat tanpa kode gudang | Error konfigurasi, transaksi ditolak | Pending |
| **TS-15** | Tuslah dan embalase | Buat resep dengan biaya tambahan | Total tagihan mencakup tuslah dan embalase | Pending |
| **TS-16** | Rollback farmasi | Simulasikan gagal insert riwayat setelah stok dikurangi | Seluruh transaksi rollback, stok kembali semula | Pending |

## Tambahan Skenario Uji Pivot (26 Mei 2026)

| ID | Skenario | Langkah Uji | Expected Result | Status |
|---|---|---|---|---|
| **TS-17** | Simulasi Optimistic Retry | Injeksi delay/race condition simulatif di `kasir.service.ts` saat insert | Catch P2002 tertangkap, log menampilkan "Retrying", nomor urut bertambah, transaksi sukses | Pending |
| **TS-18** | Depo Resolver Kosong | Hit API `/farmasi/serahkan` tanpa `kd_bangsal_asal` | Response HTTP 500/400: "Depo asal belum ditentukan..." | Pending |
| **TS-19** | Depo Resolver Spesifik | Hit API `/farmasi/serahkan` dengan depo selain B0001 | Stok yang terpotong adalah stok pada depo bersangkutan | Pending |
