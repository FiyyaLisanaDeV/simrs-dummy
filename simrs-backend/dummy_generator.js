const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'sik',
  });

  const [dokters] = await conn.query("SELECT kd_dokter FROM dokter LIMIT 5");
  const [polis] = await conn.query("SELECT kd_poli FROM poliklinik LIMIT 5");
  const [penjabs] = await conn.query("SELECT kd_pj FROM penjab LIMIT 5");
  const [tindakans] = await conn.query("SELECT kd_jenis_prw, total_byrdr FROM jns_perawatan LIMIT 10");
  const [obats] = await conn.query("SELECT kode_brng, h_beli, dasar, ralanjml, h_beli * 1.2 AS harga_jual FROM databarang LIMIT 10");

  let sql = "";
  const today = new Date().toISOString().split('T')[0];

  for(let i=1; i<=300; i++) {
    const rm = "DM" + String(i).padStart(4, '0');
    sql += `INSERT IGNORE INTO pasien (no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah, pekerjaan, stts_nikah, agama, tgl_daftar, no_tlp, pnd, keluarga, namakeluarga) VALUES ('${rm}', 'Dummy Pasien ${i}', '', 'L', 'Jakarta', '1990-01-01', 'Ibu Dummy', 'Alamat Dummy', '-', '-', 'BELUM MENIKAH', 'ISLAM', '${today}', '', '-', 'AYAH', 'Ayah Dummy');\n`;

    const no_rawat = "2026/02/23/" + String(i + 100).padStart(6, '0');
    const dokter = dokters[Math.floor(Math.random() * dokters.length)].kd_dokter;
    const poli = polis[Math.floor(Math.random() * polis.length)].kd_poli;
    const penjab = penjabs[Math.floor(Math.random() * penjabs.length)].kd_pj;

    sql += `INSERT IGNORE INTO reg_periksa (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, umurdaftar, sttsumur, status_bayar, status_poli) VALUES ('${String(i).padStart(3, '0')}', '${no_rawat}', '${today}', '10:00:00', '${dokter}', '${rm}', '${poli}', 'Sendiri', 'Alamat', 'Diri Sendiri', 0, 'Belum', 'Baru', 'Ralan', '${penjab}', 30, 'Th', 'Belum Bayar', 'Baru');\n`;

    const numTindakan = Math.floor(Math.random() * 3) + 1;
    for(let j=0; j<numTindakan; j++) {
      const t = tindakans[Math.floor(Math.random() * tindakans.length)];
      sql += `INSERT IGNORE INTO rawat_jl_dr (no_rawat, kd_jenis_prw, kd_dokter, tgl_perawatan, jam_rawat, material, bhp, tarif_tindakandr, kso, menejemen, biaya_rawat, stts_bayar) VALUES ('${no_rawat}', '${t.kd_jenis_prw}', '${dokter}', '${today}', '10:15:00', 0, 0, ${t.total_byrdr}, 0, 0, ${t.total_byrdr}, 'Belum');\n`;
    }

    const no_resep = "R" + String(i).padStart(6, '0');
    sql += `INSERT IGNORE INTO resep_obat (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan) VALUES ('${no_resep}', '${today}', '10:20:00', '${no_rawat}', '${dokter}', '${today}', '10:20:00', 'ralan', '${today}', '10:30:00');\n`;

    const numObat = Math.floor(Math.random() * 3) + 1;
    for(let j=0; j<numObat; j++) {
      const o = obats[Math.floor(Math.random() * obats.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      const harga_jual = o.harga_jual;
      const total = qty * harga_jual;
      sql += `INSERT IGNORE INTO detail_pemberian_obat (tgl_perawatan, jam, no_rawat, kode_brng, h_beli, biaya_obat, jml, embalase, tuslah, total, status, kd_bangsal, no_batch, no_faktur) VALUES ('${today}', '10:25:00', '${no_rawat}', '${o.kode_brng}', ${o.h_beli}, ${harga_jual}, ${qty}, 0, 0, ${total}, 'Ralan', '-', '-', '-');\n`;
    }
  }

  fs.writeFileSync('dummy.sql', sql);
  console.log("Written to dummy.sql");
  await conn.end();
}

main().catch(console.error);
