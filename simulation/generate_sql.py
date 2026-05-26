import random
import datetime

dokters = ['D0000002', 'D0000003', 'D0000004', 'D0000005']
polis = ['ANA', 'BDS', 'BSY']
penjabs = ['A04', 'A06', 'A07', 'A08']
tindakans = [('C011', 100000), ('C012', 150000), ('C015', 200000), ('C016', 250000), ('C019', 300000)]
obats = [('B000001489', 5000), ('B000001714', 10000), ('B000002037', 15000), ('B000008015', 20000), ('B000000133', 13000)]

today = datetime.date.today().isoformat()
sql = ""

rm = "000006" # reuse existing patient

for i in range(1, 301):
    no_rawat = f"2026/02/23/{str(i + 100).zfill(6)}"
    dokter = random.choice(dokters)
    poli = random.choice(polis)
    penjab = random.choice(penjabs)

    sql += f"INSERT IGNORE INTO reg_periksa (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, umurdaftar, sttsumur, status_bayar, status_poli) VALUES ('{str(i).zfill(3)}', '{no_rawat}', '{today}', '10:00:00', '{dokter}', '{rm}', '{poli}', 'Sendiri', 'Alamat', 'Diri Sendiri', 0, 'Belum', 'Baru', 'Ralan', '{penjab}', 30, 'Th', 'Belum Bayar', 'Baru');\n"

    num_tindakan = random.randint(1, 3)
    chosen_tindakans = random.sample(tindakans, num_tindakan)
    for t_id, t_price in chosen_tindakans:
        sql += f"INSERT IGNORE INTO rawat_jl_dr (no_rawat, kd_jenis_prw, kd_dokter, tgl_perawatan, jam_rawat, material, bhp, tarif_tindakandr, kso, menejemen, biaya_rawat, stts_bayar) VALUES ('{no_rawat}', '{t_id}', '{dokter}', '{today}', '10:15:00', 0, 0, {t_price}, 0, 0, {t_price}, 'Belum');\n"

    no_resep = f"R{str(i + 100).zfill(6)}"
    sql += f"INSERT IGNORE INTO resep_obat (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan) VALUES ('{no_resep}', '{today}', '10:20:00', '{no_rawat}', '{dokter}', '{today}', '10:20:00', 'ralan', '{today}', '10:30:00');\n"

    num_obat = random.randint(1, 3)
    chosen_obats = random.sample(obats, num_obat)
    for o_id, o_price in chosen_obats:
        qty = random.randint(1, 5)
        harga_jual = int(o_price * 1.2)
        total = qty * harga_jual
        sql += f"INSERT IGNORE INTO detail_pemberian_obat (tgl_perawatan, jam, no_rawat, kode_brng, h_beli, biaya_obat, jml, embalase, tuslah, total, status, kd_bangsal, no_batch, no_faktur) VALUES ('{today}', '10:25:00', '{no_rawat}', '{o_id}', {o_price}, {harga_jual}, {qty}, 0, 0, {total}, 'Ralan', '-', '-', '-');\n"

with open("dummy.sql", "w") as f:
    f.write(sql)
print("dummy.sql generated.")
