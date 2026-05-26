# SECURITY_AND_ACCESS_CONTROL.md

Dokumen ini menjelaskan kebijakan otorisasi dan kontrol akses *backend* dan *frontend* SIMRS-Web, berbasis dari arsitektur *Role-Based Access Control* (RBAC) SIMRS Dummy.

## 1. Skema Akses Bawaan (Legacy Database)
Akses *user* tersimpan di tabel `user` SIMRS Dummy, yang memiliki kolom boolean `(true/false)` untuk ratusan modul (misal: `penyakit`, `obat`, `kasir`, dsb). Sistem SIMRS-Web WAJIB memetakan kolom ini untuk melindungi setiap endpoint API.

## 2. Autentikasi (Authentication)
- **Metode**: JSON Web Token (JWT).
- **Expiration**: Token *expire* dalam 8 jam.
- **Payload**: Hanya menyimpan `id_user` dan *timestamp*. Tidak menyimpan detail *role* atau hak di dalam payload untuk mencegah serangan manipulasi *token* atau ukuran payload yang membengkak.

## 3. Otorisasi (Authorization / Backend Guard)
- **Validasi Dinamis**: Setiap *request* ke backend melewati Guard (`AuthGuard`) yang membedah JWT, memverifikasi tanda tangan digital. 
- **Role Guard**: Guard kedua (`RoleGuard`) memanggil hak akses spesifik dari tabel `user` atau memori *cache* (Redis/In-Memory). Jika user "Apoteker" mengakses `GET /api/kasir`, sistem akan mengecek kolom `kasir` di tabel `user`. Jika nilainya `false`, kembalikan HTTP `403 Forbidden`.

## 4. Otorisasi (Authorization / Frontend Guard)
- **Menu Hiding**: Komponen menu di React wajib memeriksa konteks *login* dan menghilangkan *button* atau navigasi yang tidak dimiliki *user*.
- **Route Protection**: Router (React Router) melindungi *Path* menggunakan HOC (`<ProtectedRoute allowedRoles={['kasir', 'admin']} />`).
- **Peringatan**: Frontend tidak pernah bisa dipercaya. Keamanan Frontend HANYA UNTUK KOSMETIK (UX). Sumber kebenaran keamanan tetap di API Backend.

## 5. Audit Trail & Log Keamanan
- Setiap transaksi krusial (Insert, Update, Delete) wajib mencatat NIP/ID User pembuat di tabel transaksi tersebut.
- Aksi-aksi yang sensitif (seperti membatalkan nota atau merubah tarif) harus dicatat pada tabel log spesifik (WIP).
- Log server tidak boleh menampilkan *payload* sensitif seperti *password*, isi pesan *error database*, atau rekaman SOAP pasien.
