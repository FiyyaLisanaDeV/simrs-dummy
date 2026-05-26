import mysql.connector
import datetime
from db_config import connection_config

def run_simulation():
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)

    print("=== Memulai Simulasi Modul 4: Farmasi & E-Resep ===\n")

    try:
        # 1. Cari Daftar Obat
        print("[Skenario 1] Cari Daftar Obat (databarang)")
        cursor.execute("""
            SELECT kode_brng, nama_brng, ralan 
            FROM databarang 
            WHERE status = '1' AND nama_brng LIKE '%paracetamol%'
            LIMIT 5
        """)
        obat_list = cursor.fetchall()
        for obat in obat_list:
            print(f"  Obat: {obat['kode_brng']} | {obat['nama_brng']} | Harga: Rp{obat['ralan']}")
        print("")

        # 2. Cek Stok Obat (gudangbarang)
        if obat_list:
            print("[Skenario 2] Cek Stok Obat di Gudang (gudangbarang)")
            kode_obat = obat_list[0]['kode_brng']
            cursor.execute("""
                SELECT kd_bangsal, stok 
                FROM gudangbarang 
                WHERE kode_brng = %s
            """, (kode_obat,))
            stok_list = cursor.fetchall()
            for stok in stok_list:
                print(f"  Gudang: {stok['kd_bangsal']} | Stok: {stok['stok']}")
            print("")

        # 3. Insert E-Resep (resep_obat & resep_dokter) -> Dry-Run
        print("[Skenario 3] Simulasi Pembuatan E-Resep (Dry-Run)")
        
        # Valid parameters from db
        no_rawat = '2026/04/20/000001'
        kd_dokter = 'D0000002'
        kode_brng = '2018001' # AB-Vask
        
        now = datetime.datetime.now()
        tgl_perawatan = now.strftime('%Y-%m-%d')
        jam = now.strftime('%H:%M:%S')

        # Generate no_resep (SIMRS Dummy format: YYYYMMDDxxxx)
        no_resep = f"{now.strftime('%Y%m%d')}0001" 

        # Insert Header Resep
        cursor.execute("""
            INSERT INTO resep_obat 
            (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_perawatan, jam, 'ralan', '0000-00-00', '00:00:00'))

        # Insert Detail Obat
        cursor.execute("""
            INSERT INTO resep_dokter 
            (no_resep, kode_brng, jml, aturan_pakai) 
            VALUES (%s, %s, %s, %s)
        """, (no_resep, kode_brng, 10, '3 x 1 Hari'))

        print(f"  ✅ INSERT Resep {no_resep} berhasil (Data Obat: {kode_brng}, Jml: 10, Aturan: 3 x 1 Hari)")

        # Selalu Rollback agar tidak menyimpan data di database SIMRS Dummy asli (hanya dry run)
        conn.rollback()
        print("  ✅ Rollback berhasil. Data asli aman dari percobaan.\n")

    except mysql.connector.Error as err:
        print(f"  ❌ Error MySQL: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        print("=== Simulasi Modul 4 SELESAI ===")

if __name__ == "__main__":
    run_simulation()
