import mysql.connector
import random
import datetime
import string
from db_config import connection_config

# Kamus Data Sederhana untuk Randomisasi
first_names = ["Budi", "Siti", "Andi", "Dewi", "Agus", "Rini", "Hendra", "Ayu", "Joko", "Sri", "Rizky", "Putri", "Dedi", "Diana", "Eko", "Maya", "Fajar", "Lestari", "Galih", "Ratna"]
last_names = ["Santoso", "Sari", "Wijaya", "Kusuma", "Setiawan", "Lestari", "Pratama", "Hidayat", "Saputra", "Wahyuni", "Nugroho", "Rahayu", "Syahputra", "Utami", "Kurniawan", "Ningsih"]
keluhan_list = ["Panas tinggi", "Batuk pilek", "Pusing dan mual", "Nyeri perut bawah", "Gatal-gatal", "Mata merah", "Telinga berdengung", "Nyeri sendi", "Sesak napas", "Lemah badan"]

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def run_mass_simulation():
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)
    
    print("=== Memulai Mass Dummy Data Test (300 Pasien) ===")
    
    try:
        # Ambil referensi master data yang valid
        cursor.execute("SELECT kd_dokter FROM dokter LIMIT 5")
        dokters = [r['kd_dokter'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_poli FROM poliklinik LIMIT 5")
        polis = [r['kd_poli'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_pj FROM penjab LIMIT 3")
        penjabs = [r['kd_pj'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_jenis_prw, tarif_tindakandr, material, bhp FROM jns_perawatan WHERE status='1' LIMIT 10")
        tindakans = cursor.fetchall()
        
        cursor.execute("SELECT kode_brng, ralan FROM databarang WHERE status='1' LIMIT 20")
        obats = cursor.fetchall()

        if not (dokters and polis and penjabs and tindakans and obats):
            print("❌ Data master tidak lengkap untuk melakukan simulasi.")
            return

        success_count = 0
        now = datetime.datetime.now()

        for i in range(1, 301):
            # Generate RM Pasien Baru: P00000 -> P00300
            no_rkm_medis = f"DMY{i:03d}"
            nm_pasien = f"{random.choice(first_names)} {random.choice(last_names)} {i}"
            
            # 1. INSERT Pasien
            cursor.execute("""
                INSERT IGNORE INTO pasien (no_rkm_medis, nm_pasien, nm_ibu, umur, kd_pj)
                VALUES (%s, %s, 'Ibu Dummy', '30', %s)
            """, (no_rkm_medis, nm_pasien, random.choice(penjabs)))
            
            # 2. INSERT Reg Periksa (Pendaftaran)
            tgl_reg = (now - datetime.timedelta(days=random.randint(0, 30))).strftime('%Y-%m-%d')
            jam_reg = f"{random.randint(7, 20):02d}:{random.randint(0, 59):02d}:{random.randint(0, 59):02d}"
            
            # Format no_rawat: YYYY/MM/DD/XXXXXX
            no_rawat = f"{tgl_reg.replace('-', '/')}/D{i:05d}"
            
            cursor.execute("""
                INSERT IGNORE INTO reg_periksa 
                (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, umurdaftar, sttsumur, status_bayar, status_poli)
                VALUES 
                (%s, %s, %s, %s, %s, %s, %s, 'Sendiri', 'Alamat Dummy', 'Suami/Istri', 15000, 'Sudah', 'Baru', 'Ralan', %s, 30, 'Th', 'Belum Bayar', 'Baru')
            """, (f"{i:03d}", no_rawat, tgl_reg, jam_reg, random.choice(dokters), no_rkm_medis, random.choice(polis), random.choice(penjabs)))

            # 3. INSERT Pemeriksaan Ralan (CPPT)
            if random.choice([True, False]): # 50% chance mendapat tindakan medis
                cursor.execute("""
                    INSERT IGNORE INTO pemeriksaan_ralan 
                    (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran, keluhan, penilaian, rtl, instruksi, evaluasi, nip)
                    VALUES (%s, %s, %s, '36.5', '120/80', '80', '20', '170', '65', '98', '15', 'Compos Mentis', %s, 'Diagnosa Dummy', 'Rencana Terapi', 'Istirahat', 'Baik', %s)
                """, (no_rawat, tgl_reg, jam_reg, random.choice(keluhan_list), random.choice(dokters)))
                
                # 4. INSERT Tindakan Dokter
                tindakan = random.choice(tindakans)
                cursor.execute("""
                    INSERT IGNORE INTO rawat_jl_dr 
                    (no_rawat, kd_jenis_prw, kd_dokter, tgl_perawatan, jam_rawat, material, bhp, tarif_tindakandr, biaya_rawat, stts_bayar)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'Belum')
                """, (no_rawat, tindakan['kd_jenis_prw'], random.choice(dokters), tgl_reg, jam_reg, tindakan['material'], tindakan['bhp'], tindakan['tarif_tindakandr'], (tindakan['material']+tindakan['bhp']+tindakan['tarif_tindakandr'])))

            # 5. INSERT Resep & Obat (Modul 4)
            if random.choice([True, False, True]): # 66% chance mendapat resep
                no_resep = f"DRX{i:05d}"
                cursor.execute("""
                    INSERT IGNORE INTO resep_obat 
                    (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_penyerahan, jam_penyerahan)
                    VALUES (%s, %s, %s, %s, %s, '0000-00-00', '00:00:00')
                """, (no_resep, tgl_reg, jam_reg, no_rawat, random.choice(dokters)))
                
                obat = random.choice(obats)
                jml_obat = random.randint(1, 10)
                cursor.execute("""
                    INSERT IGNORE INTO resep_dokter 
                    (no_resep, kode_brng, jml, aturan_pakai)
                    VALUES (%s, %s, %s, '3 x 1')
                """, (no_resep, obat['kode_brng'], jml_obat))

            success_count += 1
            if i % 50 == 0:
                print(f"  [>] {i}/300 Pasien berhasil di-generate dan dimasukkan ke alur Ralan.")

        # Komit Data ke Database untuk pengujian Real
        conn.commit()
        print(f"\n✅ SUCCESS: {success_count} Alur Kunjungan Pasien telah dikomit ke Database dengan sukses.")
        print("Anda sekarang dapat menguji fitur Dashboard, Pencarian, Antrean, Rekam Medis, E-Resep, dan Kasir dengan data massif ini!")

    except mysql.connector.Error as err:
        print(f"❌ Error MySQL: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_mass_simulation()
