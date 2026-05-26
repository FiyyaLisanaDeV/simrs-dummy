import mysql.connector
import datetime
from db_config import connection_config

def run_simulation():
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)

    print("=== Memulai Simulasi Modul 4.1: Farmasi & E-Resep Racikan ===\n")

    try:
        # 1. Fetch Master Metode Racik
        print("[Skenario 1] Menarik Master Metode Racik")
        cursor.execute("SELECT kd_racik, nm_racik FROM metode_racik LIMIT 5")
        metode_list = cursor.fetchall()
        for m in metode_list:
            print(f"  Metode: {m['kd_racik']} | {m['nm_racik']}")
        
        # 2. Persiapan Data Mock E-Resep
        now = datetime.datetime.now()
        no_rawat = '2026/04/20/000001'
        kd_dokter = 'D0000002'
        tgl = now.strftime('%Y-%m-%d')
        jam = now.strftime('%H:%M:%S')
        no_resep = f"{now.strftime('%Y%m%d')}0099" # Fake id

        print(f"\n[Skenario 2] Membuat Resep Header ({no_resep})")
        cursor.execute("""
            INSERT INTO resep_obat 
            (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (no_resep, tgl, jam, no_rawat, kd_dokter, tgl, jam, 'ralan', '0000-00-00', '00:00:00'))

        # 3. Insert Racikan Header (resep_dokter_racikan)
        print("\n[Skenario 3] Insert Header Racikan")
        no_racik = '1'
        kd_racik = metode_list[0]['kd_racik'] if metode_list else 'R01'
        jml_dr = 10
        aturan = '3 x 1 Hari'

        cursor.execute("""
            INSERT INTO resep_dokter_racikan
            (no_resep, no_racik, nama_racik, kd_racik, jml_dr, aturan_pakai, keterangan)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (no_resep, no_racik, 'Puyer Anak Demam', kd_racik, jml_dr, aturan, 'Sesudah Makan'))
        
        # 4. Insert Racikan Detail (resep_dokter_racikan_detail)
        print("\n[Skenario 4] Insert Komponen Obat Racikan")
        # Komponen 1: Paracetamol (misal obat kode 2018001), P1=1, P2=2
        kode_brng_1 = '2018001'
        p1 = 1
        p2 = 2
        jml_total_1 = (p1 / p2) * jml_dr
        
        cursor.execute("""
            INSERT INTO resep_dokter_racikan_detail
            (no_resep, no_racik, kode_brng, p1, p2, kandungan, jml)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (no_resep, no_racik, kode_brng_1, p1, p2, '250mg', jml_total_1))

        print(f"  ✅ INSERT Komponen berhasil: {kode_brng_1}, P1: {p1}, P2: {p2}, Jml Total Fisis: {jml_total_1}")

        # Selalu Rollback agar aman
        conn.rollback()
        print("\n  ✅ Semua constraint relasi lolos! Rollback berhasil. Data asli aman dari percobaan.\n")

    except mysql.connector.Error as err:
        print(f"  ❌ Error MySQL: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        print("=== Simulasi Modul 4.1 SELESAI ===")

if __name__ == "__main__":
    run_simulation()
