# Pustaka

Dokumen ini berisi referensi pelengkap yang bisa dipakai saat menambah fitur
SIMRS, terutama untuk integrasi BPJS dan layanan bridging.

## Referensi Utama

### JKN - BPJS Bridging API untuk NodeJS

- Repository: https://github.com/ssecd/jkn
- Jenis: library bridging BPJS untuk NodeJS
- Cakupan fitur:
  - Aplicares
  - VClaim
  - Antrean
  - Apotek
  - i-Care
  - Rekam Medis
  - PCare parsial

### Kenapa relevan

Repo ini berguna sebagai referensi saat mengembangkan fitur SIMRS yang
berhubungan dengan:

- bridging BPJS
- SEP dan alur VClaim
- antrean layanan
- integrasi apotek
- rekam medis elektronik
- sinkronisasi data layanan BPJS

### Catatan

- Gunakan dokumentasi resmi BPJS dan TrustMark sebagai sumber kebenaran utama.
- Pakai repo ini sebagai referensi implementasi dan pola integrasi, bukan
  sebagai pengganti validasi regulasi atau endpoint resmi.
- Jika fitur ini akan dipakai di produksi, tetap perlu audit keamanan, logging,
  dan pengujian integrasi end-to-end.
