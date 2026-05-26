import mysql.connector
import random
import datetime
from db_config import connection_config

db = mysql.connector.connect(**connection_config())
cursor = db.cursor(dictionary=True)

print("Fetching valid references...")
cursor.execute("SELECT kd_dokter FROM dokter LIMIT 5")
dokters = [row['kd_dokter'] for row in cursor.fetchall()]

cursor.execute("SELECT kd_poli FROM poliklinik LIMIT 5")
polis = [row['kd_poli'] for row in cursor.fetchall()]

cursor.execute("SELECT kd_pj FROM penjab LIMIT 5")
penjabs = [row['kd_pj'] for row in cursor.fetchall()]

cursor.execute("SELECT kd_jenis_prw, total_byrdr FROM jns_perawatan LIMIT 10")
tindakans = cursor.fetchall()

cursor.execute("SELECT kode_brng, h_beli, dasar, ralanjml, h_beli * 1.2 AS harga_jual FROM databarang LIMIT 10")
obats = cursor.fetchall()

print("Generating 300 dummy patients...")

today = datetime.date.today()

for i in range(1, 301):
    rm_str = f"DM{str(i).zfill(4)}"
    # insert pasien
    cursor.execute("""
        INSERT IGNORE INTO pasien (
            no_rkm_medis, nm_pasien, no_ktp, jk, tmp_lahir, tgl_lahir, nm_ibu, alamat, gol_darah, pekerjaan, stts_nikah, agama, tgl_daftar, no_tlp, pnd, keluarga, namakeluarga
        ) VALUES (
            %s, %s, '', 'L', 'Jakarta', '1990-01-01', 'Ibu Dummy', 'Alamat Dummy', '-', '-', 'BELUM MENIKAH', 'ISLAM', %s, '', '-', 'AYAH', 'Ayah Dummy'
        )
    """, (rm_str, f"Dummy Pasien {i}", today))
    
    no_rawat = f"2026/02/23/{str(i + 100).zfill(6)}"
    
    # reg_periksa
    dokter = random.choice(dokters)
    poli = random.choice(polis)
    penjab = random.choice(penjabs)
    cursor.execute("""
        INSERT IGNORE INTO reg_periksa (
            no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, umurdaftar, sttsumur, status_bayar, status_poli
        ) VALUES (
            %s, %s, %s, '10:00:00', %s, %s, %s, 'Sendiri', 'Alamat', 'Diri Sendiri', 0, 'Belum', 'Baru', 'Ralan', %s, 30, 'Th', 'Belum Bayar', 'Baru'
        )
    """, (str(i).zfill(3), no_rawat, today, dokter, rm_str, poli, penjab))
    
    # 1 to 3 tindakans
    num_tindakan = random.randint(1, 3)
    chosen_tindakans = random.sample(tindakans, num_tindakan)
    for t in chosen_tindakans:
        cursor.execute("""
            INSERT IGNORE INTO rawat_jl_dr (
                no_rawat, kd_jenis_prw, kd_dokter, tgl_perawatan, jam_rawat, material, bhp, tarif_tindakandr, kso, menejemen, biaya_rawat, stts_bayar
            ) VALUES (
                %s, %s, %s, %s, '10:15:00', 0, 0, %s, 0, 0, %s, 'Belum'
            )
        """, (no_rawat, t['kd_jenis_prw'], dokter, today, t['total_byrdr'], t['total_byrdr']))

    # 1 to 3 medicines
    no_resep = f"R{str(i).zfill(6)}"
    cursor.execute("""
        INSERT IGNORE INTO resep_obat (
            no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan
        ) VALUES (
            %s, %s, '10:20:00', %s, %s, %s, '10:20:00', 'ralan', %s, '10:30:00'
        )
    """, (no_resep, today, no_rawat, dokter, today, today))
    
    num_obat = random.randint(1, 3)
    chosen_obats = random.sample(obats, num_obat)
    for o in chosen_obats:
        qty = random.randint(1, 5)
        harga_jual = o['h_beli'] * 1.2
        total = qty * harga_jual
        cursor.execute("""
            INSERT IGNORE INTO detail_pemberian_obat (
                tgl_perawatan, jam, no_rawat, kode_brng, h_beli, biaya_obat, jml, embalase, tuslah, total, status, kd_bangsal, no_batch, no_faktur
            ) VALUES (
                %s, '10:25:00', %s, %s, %s, %s, %s, 0, 0, %s, 'Ralan', '-', '-', '-'
            )
        """, (today, no_rawat, o['kode_brng'], o['h_beli'], harga_jual, qty, total))

db.commit()
print("300 Dummy records inserted successfully!")
