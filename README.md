# SIMRS Dummy

Platform prototipe sistem informasi rumah sakit berbasis web untuk memvalidasi
alur pendaftaran, pelayanan klinis, farmasi, laboratorium, rawat inap, operasi,
dan kasir terhadap database MariaDB `sik`.

> [!CAUTION]
> Proyek ini masih berstatus prototipe. Jangan digunakan untuk operasional
> produksi sebelum kontrol akses, audit trail, konsistensi stok, dan transaksi
> keuangan dinyatakan lulus pada checklist produksi.

## Navigasi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Lokal](#menjalankan-lokal)
- [Konfigurasi](#konfigurasi)
- [Validasi](#validasi)
- [Dokumentasi](#dokumentasi)

## Fitur

| Modul | Cakupan Saat Ini | Status |
| --- | --- | --- |
| Autentikasi | Login admin dan token JWT | Prototipe |
| Pendaftaran | Pencarian pasien dan registrasi kunjungan | Prototipe |
| Antrean dan Bed | Antrean harian dan ketersediaan kamar | Prototipe |
| RME/CPPT | SOAP rawat jalan/rawat inap dan diagnosis ICD-10 | Prototipe |
| Farmasi/Apotek | Resep, racikan, validasi, dan serah obat | Perlu penguatan stok |
| Laboratorium | Master pemeriksaan, permintaan, antrean, hasil | Prototipe |
| Operasi | Paket operasi dan input layanan | Prototipe |
| Kasir | Tagihan, pembayaran, nota, dan jurnal | Perlu penguatan konkurensi |

## Teknologi

| Komponen | Teknologi | Port Lokal |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS | `5173` |
| Backend | NestJS 11, Prisma, JWT | `3000` |
| Database | MariaDB, database `sik` | sesuai environment |
| Simulasi | Python dan notebook dry-run | tidak berlaku |

## Struktur Proyek

```text
simrs-web/
|-- docs/                  # status, keputusan, risiko, testing, readiness
|-- simrs-backend/
|   |-- prisma/            # pemetaan model database
|   |-- src/               # modul API NestJS
|   `-- .env.example       # template konfigurasi tanpa secret
|-- simrs-frontend/
|   `-- src/               # halaman, komponen, dan client API React
|-- simulation/            # validasi SQL dan skenario dry-run
`-- README.md
```

<details>
<summary>Modul backend utama</summary>

| Folder | Fungsi |
| --- | --- |
| `src/auth/` | login dan validasi JWT |
| `src/patient/` | pencarian dan detail pasien |
| `src/registration/` | registrasi kunjungan |
| `src/queue/`, `src/bed/`, `src/ranap/` | antrean dan rawat inap |
| `src/rme/` | rekam medis dan ICD-10 |
| `src/farmasi/` | resep serta layanan apotek |
| `src/lab/`, `src/operasi/` | layanan penunjang |
| `src/kasir/`, `src/casemix/`, `src/bpjs/` | billing dan klaim |

</details>

## Menjalankan Lokal

### 1. Backend

```bash
cd simrs-backend
cp .env.example .env
npm install
npm run start:dev
```

Isi `.env` dengan konfigurasi lokal yang benar sebelum menjalankan backend.

### 2. Frontend

```bash
cd simrs-frontend
npm install
npm run dev
```

Akses aplikasi melalui `http://localhost:5173`.

## Konfigurasi

Gunakan [simrs-backend/.env.example](simrs-backend/.env.example) sebagai
template. Jangan commit `.env` atau secret aktual.

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | koneksi Prisma menuju MariaDB |
| `JWT_SECRET` | kunci penandatanganan token aplikasi |
| `SIMRS_ADMIN_USERNAME_KEY` | konfigurasi dekripsi username admin lokal |
| `SIMRS_ADMIN_PASSWORD_KEY` | konfigurasi dekripsi password admin lokal |
| `DEFAULT_APOTEK_RAWAT_JALAN_KODE_BANGSAL` | kode depo untuk layanan apotek |
| `SIMRS_DB_*` | koneksi yang digunakan skrip di `simulation/` |

## Validasi

```bash
cd simrs-backend
npm run build

cd ../simrs-frontend
npm run build

cd ..
python3 -m compileall -q simulation
```

Catatan saat ini: unit test backend masih memerlukan pembenahan mock dependency
NestJS/Prisma sebelum dapat dijadikan quality gate.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [Build Summary](docs/Build_Summary.md) | arsitektur, modul, alur, konfigurasi, dan status build rinci |
| [Current State](docs/CURRENT_STATE.md) | status implementasi dan batasan aktual |
| [Decision Log](docs/DECISION_LOG.md) | keputusan teknis yang berlaku |
| [Risk Register](docs/RISK_REGISTER.md) | risiko dan mitigasi |
| [Testing Matrix](docs/TESTING_MATRIX.md) | skenario verifikasi |
| [Production Checklist](docs/PRODUCTION_READINESS_CHECKLIST.md) | syarat sebelum penggunaan nyata |
| [Rollback Plan](docs/ROLLBACK_PLAN.md) | prosedur pemulihan |
| [Security and Access Control](docs/SECURITY_AND_ACCESS_CONTROL.md) | arah kontrol akses |
