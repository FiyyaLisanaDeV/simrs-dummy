import mysql.connector
from datetime import datetime
from db_config import connection_config

def test_patient_search_and_registration():
    print("=== Memulai Simulasi Modul 1: Manajemen Pasien & Registrasi ===")
    
    try:
        conn = mysql.connector.connect(**connection_config())
        cursor = conn.cursor(dictionary=True)
        
        # Skenario 1: Pencarian Pasien
        search_keyword = "a" # Cari nama pasien mengandung 'a'
        print(f"\n[Skenario 1] Mencari pasien dengan keyword: '{search_keyword}'")
        
        query_search = """
            SELECT 
                p.no_rkm_medis, p.nm_pasien, p.no_ktp, p.tgl_lahir, p.jk, p.alamat,
                pj.png_jawab as asuransi
            FROM pasien p
            LEFT JOIN penjab pj ON p.kd_pj = pj.kd_pj
            WHERE p.nm_pasien LIKE %s OR p.no_ktp LIKE %s
            LIMIT 3
        """
        cursor.execute(query_search, (f"%{search_keyword}%", f"%{search_keyword}%"))
        patients = cursor.fetchall()
        
        if not patients:
            print("❌ Tidak ada pasien ditemukan.")
            return
            
        for idx, p in enumerate(patients):
            print(f"  {idx+1}. RM: {p['no_rkm_medis']} | Nama: {p['nm_pasien']} | NIK: {p['no_ktp']} | Asuransi: {p['asuransi']}")
            
        # Pilih pasien pertama untuk didaftarkan
        target_patient = patients[0]
        
        # Cari Poliklinik & Dokter secara acak untuk pendaftaran
        cursor.execute("SELECT kd_poli, nm_poli FROM poliklinik LIMIT 1")
        poli = cursor.fetchone()
        
        cursor.execute("SELECT kd_dokter, nm_dokter FROM dokter LIMIT 1")
        dokter = cursor.fetchone()
        
        # Penanggung Jawab
        cursor.execute("SELECT kd_pj FROM penjab WHERE png_jawab LIKE '%UMUM%' LIMIT 1")
        pj = cursor.fetchone()
        
        if not (poli and dokter and pj):
            print("❌ Data Poli / Dokter / Asuransi belum lengkap untuk simulasi pendaftaran.")
            return
            
        print(f"\n[Skenario 2] Mensimulasikan Pendaftaran Rawat Jalan")
        print(f"Pasien  : {target_patient['nm_pasien']} ({target_patient['no_rkm_medis']})")
        print(f"Poli    : {poli['nm_poli']} ({poli['kd_poli']})")
        print(f"Dokter  : {dokter['nm_dokter']} ({dokter['kd_dokter']})")
        print(f"Bayar   : {pj['kd_pj']}")
        
        # Generate No Rawat (Format SIMRS Dummy: YYYY/MM/DD/NoUrut)
        today = datetime.now()
        date_str = today.strftime('%Y/%m/%d')
        
        # Cari no urut terakhir hari ini
        cursor.execute("SELECT no_rawat FROM reg_periksa WHERE tgl_registrasi = %s ORDER BY no_rawat DESC LIMIT 1", (today.strftime('%Y-%m-%d'),))
        last_reg = cursor.fetchone()
        
        no_urut = "000001"
        if last_reg:
            last_no = last_reg['no_rawat'].split('/')[-1]
            no_urut = str(int(last_no) + 1).zfill(6)
            
        no_rawat = f"{date_str}/{no_urut}"
        
        # Cari nomor registrasi antrean poli hari ini
        cursor.execute("SELECT no_reg FROM reg_periksa WHERE kd_poli = %s AND tgl_registrasi = %s AND kd_dokter = %s ORDER BY no_reg DESC LIMIT 1", 
                       (poli['kd_poli'], today.strftime('%Y-%m-%d'), dokter['kd_dokter']))
        last_antrean = cursor.fetchone()
        no_reg = "001"
        if last_antrean:
            no_reg = str(int(last_antrean['no_reg']) + 1).zfill(3)
        
        print(f"Generated No Rawat: {no_rawat}, No Antrean: {no_reg}")
        
        # Insert Registrasi (Dry-run / Simulasi)
        query_insert = """
            INSERT INTO reg_periksa 
            (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, 
             p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, 
             umurdaftar, sttsumur, status_bayar, status_poli) 
            VALUES 
            (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            no_reg, no_rawat, today.strftime('%Y-%m-%d'), today.strftime('%H:%M:%S'),
            dokter['kd_dokter'], target_patient['no_rkm_medis'], poli['kd_poli'],
            'Mandiri', 'Alamat', 'Sendiri', 0, 'Belum', 'Lama', 'Ralan', pj['kd_pj'],
            0, 'Th', 'Belum Bayar', 'Lama'
        )
        
        # Kita jalankan dan kemudian kita rollback agar data dummy tidak kotor
        cursor.execute(query_insert, values)
        print("✅ Simulasi eksekusi INSERT ke `reg_periksa` berhasil dilakukan di memori.")
        
        # Hapus data / Rollback
        conn.rollback()
        print("✅ Rollback berhasil. Data SIMRS Dummy tetap aman.")
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    test_patient_search_and_registration()
