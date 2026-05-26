import mysql.connector
from datetime import datetime
from db_config import connection_config

def test_queue_and_bed_management():
    print("=== Memulai Simulasi Modul 2: Antrean Poli & Manajemen Bed (Rawat Inap) ===")
    
    try:
        conn = mysql.connector.connect(**connection_config())
        cursor = conn.cursor(dictionary=True)
        today = datetime.now()
        
        # Skenario 1: Menarik Data Antrean Poli (Real-time)
        print("\n[Skenario 1] Menarik Data Antrean Poliklinik (Pendaftar 'Belum' Dilayani)")
        query_queue = """
            SELECT r.no_rawat, r.no_reg, p.nm_pasien, pl.nm_poli, r.stts
            FROM reg_periksa r
            JOIN pasien p ON r.no_rkm_medis = p.no_rkm_medis
            JOIN poliklinik pl ON r.kd_poli = pl.kd_poli
            WHERE r.tgl_registrasi = %s AND r.stts = 'Belum'
            ORDER BY r.no_reg ASC
            LIMIT 5
        """
        cursor.execute(query_queue, (today.strftime('%Y-%m-%d'),))
        antrean = cursor.fetchall()
        
        if antrean:
            for q in antrean:
                print(f" - No Antrean: {q['no_reg']} | No Rawat: {q['no_rawat']} | Poli: {q['nm_poli']} | Pasien: {q['nm_pasien']} | Status: {q['stts']}")
        else:
            print(" - Tidak ada antrean berstatus 'Belum' hari ini. (Normal jika belum ada yang daftar hari ini)")
            
        # Skenario 2: Bed Management (Mencari Kasur Kosong)
        print("\n[Skenario 2] Bed Management (Mencari Kamar/Kasur Kosong)")
        query_bed = """
            SELECT k.kd_kamar, k.kelas, k.trf_kamar, b.nm_bangsal, k.status
            FROM kamar k
            JOIN bangsal b ON k.kd_bangsal = b.kd_bangsal
            WHERE k.status = 'KOSONG' AND k.statusdata = '1'
            LIMIT 3
        """
        cursor.execute(query_bed)
        beds = cursor.fetchall()
        
        if not beds:
            print("❌ Tidak ada kamar kosong ditemukan!")
            return
            
        for b in beds:
            print(f" - Kamar: {b['kd_kamar']} ({b['nm_bangsal']}) | Kelas: {b['kelas']} | Status: {b['status']}")
            
        selected_bed = beds[0]
        
        # Skenario 3: Simulasi Admisi Rawat Inap (Mutasi Status Bed)
        print(f"\n[Skenario 3] Simulasi Admisi Rawat Inap")
        # Menggunakan data dummy pendaftaran rawat inap
        # Pada sistem asli, no_rawat akan dicari jika via poli, atau di-generate jika direct admission.
        no_rawat_sim = f"{today.strftime('%Y/%m/%d')}/999999" # Dummy
        print(f"Mendaftarkan No Rawat {no_rawat_sim} ke Kamar {selected_bed['kd_kamar']}")
        
        # Insert ke kamar_inap
        query_inap = """
            INSERT INTO kamar_inap 
            (no_rawat, kd_kamar, trf_kamar, diagnosa_awal, diagnosa_akhir, 
             tgl_masuk, jam_masuk, tgl_keluar, jam_keluar, lama, ttl_biaya, stts_pulang)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        val_inap = (
            no_rawat_sim, selected_bed['kd_kamar'], selected_bed['trf_kamar'], 
            'Demam', '-', today.strftime('%Y-%m-%d'), today.strftime('%H:%M:%S'), 
            '0000-00-00', '00:00:00', 0, 0, '-'
        )
        
        cursor.execute(query_inap, val_inap)
        print("✅ Data berhasil di-insert ke tabel kamar_inap (memori).")
        
        # Update status kamar menjadi ISI
        query_update_kamar = "UPDATE kamar SET status = 'ISI' WHERE kd_kamar = %s"
        cursor.execute(query_update_kamar, (selected_bed['kd_kamar'],))
        print(f"✅ Status tabel kamar '{selected_bed['kd_kamar']}' berhasil di-set menjadi 'ISI' (memori).")
        
        # Rollback
        conn.rollback()
        print("✅ Rollback berhasil. Seluruh mutasi dibatalkan (Data asli tetap aman).")
            
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    test_queue_and_bed_management()
