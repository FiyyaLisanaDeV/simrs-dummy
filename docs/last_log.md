# Last Log - Rollback Checkpoint

Tanggal: 2026-05-26 (Asia/Makassar)
Project: SIMRS Dummy
Remote: `https://github.com/FiyyaLisanaDeV/simrs-dummy.git`
Branch: `main`
Checkpoint commit: `db8c047b634f5baaf28e63bac7169fa8239fcddc`

## Tujuan Checkpoint

Checkpoint ini menandai kondisi publik yang telah dibersihkan dan dapat
digunakan sebagai titik kembali sebelum pengembangan lanjutan.
Dokumen checkpoint dipublikasikan setelah commit tersebut agar SHA rollback
tetap menunjuk keadaan proyek yang sudah diverifikasi.

## Kondisi Stabil

- `README.md` telah diganti dengan dokumentasi halaman depan proyek yang
  memuat fitur, struktur, setup, konfigurasi, validasi, dan tautan dokumen.
- `docs/Build_Summary.md` telah ditambahkan sebagai ringkasan build rinci
  disertai aset mockup visual dashboard pada `docs/assets/`.
- Branding dokumentasi publik telah menggunakan `SIMRS Dummy`.
- Arsip dokumentasi sesi lama tidak lagi dilacak Git dan tetap tersedia lokal
  di `docs/archive_legacy_docs/`.
- File referensi skema introspeksi penuh tidak dipublikasikan dan tetap
  tersedia lokal di `simrs-backend/prisma/schema-introspect.prisma`.
- Konfigurasi autentikasi publik menggunakan `SIMRS_ADMIN_USERNAME_KEY` dan
  `SIMRS_ADMIN_PASSWORD_KEY`, bukan nilai literal.
- `simulation/dump_schema.py` menulis output ke lokasi lokal yang dapat diatur
  melalui `SIMRS_SCHEMA_DUMP_PATH`.

## Berkas Lokal Yang Tidak Dipublikasikan

- `.secrets/`
- `.workspace/`
- `docs/archive_legacy_docs/`
- `simrs-backend/.env`
- `simrs-backend/prisma/schema-introspect.prisma`
- build output, dependency directory, log, virtual environment, dan notebook
  yang menyimpan hasil pembacaan database.

## Verifikasi Terakhir

- `cd simrs-backend && npm run build` - lulus.
- `cd simrs-frontend && npm run build` - lulus.
- `python3 -m compileall -q simulation` - lulus.
- Pemeriksaan tree Git publik tidak menemukan artefak sesi lama atau nama
  sistem sebelumnya.

## Risiko Yang Belum Selesai

- Unit test backend memerlukan perbaikan mock dependency NestJS/Prisma; run
  sebelumnya menghasilkan 19 test gagal karena provider belum disiapkan pada
  `TestingModule`.
- Modul masih berstatus prototipe dan belum layak penggunaan produksi.

## Cara Rollback

Untuk mengembalikan branch kerja ke checkpoint publik ini:

```bash
git fetch origin main
git switch main
git reset --hard db8c047b634f5baaf28e63bac7169fa8239fcddc
```

Perintah `git reset --hard` menghapus perubahan lokal yang belum disimpan;
gunakan hanya saat rollback memang disetujui.
