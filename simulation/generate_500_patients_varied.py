import mysql.connector
import random
import datetime
import string
from db_config import connection_config

# Kamus Data untuk Randomisasi
first_names = ["Ahmad", "Siti", "Budi", "Dewi", "Eko", "Rini", "Hendra", "Ayu", "Joko", "Sri", "Rizky", "Putri", "Dedi", "Diana", "Fajar", "Lestari", "Galih", "Ratna", "Yusuf", "Kartika", "Rudi", "Mega", "Hadi", "Anisa", "Wawan", "Fitri", "Tono", "Rina", "Bambang", "Indah"]
last_names = ["Santoso", "Sari", "Wijaya", "Kusuma", "Setiawan", "Pratama", "Hidayat", "Saputra", "Wahyuni", "Nugroho", "Rahayu", "Syahputra", "Utami", "Kurniawan", "Ningsih", "Gunawan", "Susanti", "Purnama", "Siregar", "Lubis"]
occupations = ["Swasta", "PNS", "Wiraswasta", "Ibu Rumah Tangga", "Pelajar", "Mahasiswa", "Buruh", "Pensiunan", "TNI/Polri", "Tidak Bekerja"]
addresses = ["Jl. Sudirman No. 12", "Jl. Merdeka No. 45", "Jl. Mawar No. 8", "Jl. Melati No. 15", "Jl. Gatot Subroto No. 99", "Jl. Diponegoro No. 3", "Jl. Asia Afrika No. 27", "Jl. Kartini No. 14"]
diagnoses = ["Hipertensi", "Dyspepsia", "Diabetes Mellitus", "Faringitis Akut", "Gastroenteritis", "Common Cold", "Apendingitis Akut", "Asma Bronkial", "Dermatitis", "Tonsilitis"]
anesthesia_types = ["Spinal", "Umum", "Lokal", "Regional"]
keluhan_list = [
    "Pusing, nyeri kepala bagian belakang sejak 3 hari",
    "Nyeri ulu hati, mual dan kembung terutama setelah makan",
    "Sering merasa haus, lapar, dan buang air kecil di malam hari",
    "Demam tinggi mendadak disertai batuk pilek dan radang tenggorokan",
    "Buang air besar cair lebih dari 5 kali hari ini, lemas",
    "Sesak napas kambuh terutama saat udara dingin",
    "Gatal-gatal kemerahan di area lengan dan leher",
    "Nyeri perut kanan bawah yang semakin hebat terutama saat ditekan",
    "Nyeri sendi lutut terutama saat beraktivitas",
    "Mata merah dan berair disertai rasa mengganjal"
]

def run_500_varied_simulation():
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)
    
    print("=== MEMULAI TEST PENGINPUTAN DATA 500 PASIEN BERVARIATIF (ZERO-NULL CONFIG) ===")
    
    try:
        # 1. Tarik referensi master data
        cursor.execute("SELECT kd_dokter FROM dokter")
        dokters = [r['kd_dokter'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_poli FROM poliklinik")
        polis = [r['kd_poli'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_pj FROM penjab")
        penjabs = [r['kd_pj'] for r in cursor.fetchall()]
        
        cursor.execute("SELECT kd_jenis_prw, tarif_tindakandr, material, bhp FROM jns_perawatan")
        tindakans = cursor.fetchall()
        
        cursor.execute("SELECT kode_brng, ralan FROM databarang")
        obats = cursor.fetchall()
        
        cursor.execute("SELECT kd_kamar, trf_kamar, kd_bangsal FROM kamar")
        kamars = cursor.fetchall()
        
        cursor.execute("SELECT kd_jenis_prw, bagian_rs, bhp, tarif_perujuk, tarif_tindakan_dokter, tarif_tindakan_petugas, total_byr, kategori FROM jns_perawatan_lab")
        labs = cursor.fetchall()

        if not (dokters and polis and penjabs and tindakans and obats and kamars and labs):
            print("❌ Master data tidak lengkap. Harap jalankan script inisialisasi master data terlebih dahulu.")
            return

        now = datetime.datetime.now()
        success_count = 0
        
        # Bersihkan tabel lama agar tidak tumpang tindih
        tables_to_truncate = ['detailjurnal', 'jurnal', 'nota_jalan', 'detail_pemberian_obat', 'resep_dokter', 'resep_obat', 'detail_periksa_lab', 'periksa_lab', 'operasi', 'pemeriksaan_ranap', 'kamar_inap', 'rawat_jl_dr', 'pemeriksaan_ralan', 'reg_periksa', 'pasien', 'template_laboratorium']
        print("Truncating old simulation tables for fresh zero-null state...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        for t in tables_to_truncate:
            cursor.execute(f"TRUNCATE TABLE {t};")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")

        print("Seeding template_laboratorium with default templates...")
        lab_templates = {}
        for lab in labs:
            cursor.execute("""
                INSERT INTO template_laboratorium (kd_jenis_prw, Pemeriksaan, satuan, nilai_rujukan_ld, nilai_rujukan_la, nilai_rujukan_pd, nilai_rujukan_pa, bagian_rs, bhp, bagian_perujuk, bagian_dokter, bagian_laborat, kso, menejemen, biaya_item, urut)
                VALUES (%s, 'Tes Darah Lengkap', 'g/dL', '12-16', '12-16', '12-16', '12-16', %s, %s, %s, %s, 10000.0, 2000.0, 3000.0, %s, 1)
            """, (lab['kd_jenis_prw'], lab['bagian_rs'] or 0.0, lab['bhp'] or 0.0, lab['tarif_perujuk'] or 0.0, lab['tarif_tindakan_dokter'] or 0.0, lab['total_byr'] or 0.0))
            lab_templates[lab['kd_jenis_prw']] = cursor.lastrowid
        
        for i in range(1, 501):
            no_rkm_medis = f"DMV{i:03d}"
            nm_pasien = f"{random.choice(first_names)} {random.choice(last_names)} {i}"
            chosen_obats = []
            no_resep = "-"
            
            # --- A. VARIATIVE DEMOGRAPHICS & CLINICS ---
            # Randomize Age & Gender
            age_num = random.randint(0, 80)
            if age_num <= 2:
                umur = f"{random.randint(1, 23)}"
                sttsumur = "Bl" # Bulan
            elif age_num <= 12:
                umur = f"{age_num}"
                sttsumur = "Th" # Tahun Anak
            else:
                umur = f"{age_num}"
                sttsumur = "Th" # Tahun Dewasa

            jk = "L" if random.choice([True, False]) else "P"
            occupation = random.choice(occupations) if age_num > 17 else "Belum Bekerja"
            address = random.choice(addresses)
            penjab = random.choice(penjabs)
            
            # Generasikan nomor KTP, telepon, dan nomor BPJS buatan agar tidak null
            no_ktp = f"3171{random.randint(100000000000, 999999999999)}"
            no_tlp = f"0812{random.randint(10000000, 99999999)}"
            no_peserta = f"000{random.randint(1000000000, 9999999999)}"
            
            # 1. INSERT PASIEN
            cursor.execute("""
                INSERT INTO pasien (no_rkm_medis, nm_pasien, no_ktp, tmp_lahir, tgl_lahir, nm_ibu, alamat, pekerjaan, agama, tgl_daftar, no_tlp, umur, kd_pj, no_peserta)
                VALUES (%s, %s, %s, 'Jakarta', '1990-01-01', 'Ibu Dummy', %s, %s, 'ISLAM', %s, %s, %s, %s, %s)
            """, (no_rkm_medis, nm_pasien, no_ktp, address, occupation, now.date(), no_tlp, f"{umur} {sttsumur}", penjab, no_peserta))

            # --- B. VARIATIVE CLINICAL CONDITIONS & VISIT STATUSES ---
            if age_num <= 12:
                kd_poli = "ANA"  # Anak-anak masuk Poli Anak
            elif random.choice([True, False, False]):
                kd_poli = "BDS"  # Kasus bedah
            else:
                kd_poli = "BSY"  # Penyakit dalam

            kd_dokter = random.choice(dokters)
            
            # Menentukan status kunjungan bervariasi:
            # 60% Sudah, 15% Dirawat, 10% Belum, 5% Batal, 5% Dirujuk, 5% Meninggal
            status_rand = random.random()
            if status_rand < 0.60:
                stts = "Sudah"
                status_bayar = "Sudah Bayar" if random.choice([True, False, True]) else "Belum Bayar"
            elif status_rand < 0.75:
                stts = "Dirawat"
                status_bayar = "Belum Bayar"
            elif status_rand < 0.85:
                stts = "Belum"
                status_bayar = "Belum Bayar"
            elif status_rand < 0.90:
                stts = "Batal"
                status_bayar = "Belum Bayar"
            elif status_rand < 0.95:
                stts = "Dirujuk"
                status_bayar = "Belum Bayar"
            else:
                stts = "Meninggal"
                status_bayar = "Belum Bayar"

            tgl_reg = (now - datetime.timedelta(days=random.randint(0, 10))).strftime('%Y-%m-%d')
            jam_reg = f"{random.randint(7, 20):02d}:{random.randint(0, 59):02d}:{random.randint(0, 59):02d}"
            no_rawat = f"{tgl_reg.replace('-', '/')}/V{i:05d}"
            
            # 2. INSERT REG PERIKSA
            cursor.execute("""
                INSERT INTO reg_periksa 
                (no_reg, no_rawat, tgl_registrasi, jam_reg, kd_dokter, no_rkm_medis, kd_poli, p_jawab, almt_pj, hubunganpj, biaya_reg, stts, stts_daftar, status_lanjut, kd_pj, umurdaftar, sttsumur, status_bayar, status_poli)
                VALUES 
                (%s, %s, %s, %s, %s, %s, %s, 'Keluarga Pasien', %s, 'Ayah/Ibu', 15000, %s, 'Baru', 'Ralan', %s, %s, %s, %s, 'Baru')
            """, (f"{i:03d}", no_rawat, tgl_reg, jam_reg, kd_dokter, no_rkm_medis, kd_poli, address, stts, penjab, umur, sttsumur, "Belum Bayar" if status_bayar == "Belum Bayar" else "Sudah Bayar"))

            # Jika pendaftaran dibatalkan, kita lewati intervensi klinis
            if stts == "Batal":
                success_count += 1
                continue

            # --- C. CLINICAL INTERVENTIONS ---
            diagnosa = random.choice(diagnoses)
            keluhan = random.choice(keluhan_list)
            
            # 3. CPPT/SOAP (Hanya untuk pasien yang statusnya bukan 'Belum')
            if stts != "Belum":
                suhu = f"{random.uniform(36.0, 38.5):.1f}"
                tensi = f"{random.randint(110, 130)}/{random.randint(70, 85)}"
                nadi = f"{random.randint(72, 95)}"
                respirasi = f"{random.randint(16, 22)}"
                tinggi = f"{random.randint(155, 180)}"
                berat = f"{random.randint(50, 85)}"
                spo2 = f"{random.randint(97, 100)}"
                
                cursor.execute("""
                    INSERT INTO pemeriksaan_ralan 
                    (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran, keluhan, pemeriksaan, alergi, lingkar_perut, penilaian, rtl, instruksi, evaluasi, nip)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '15', 'Compos Mentis', %s, 'Keadaan umum baik, konjungtiva tidak anemis, bising usus normal', 'Tidak Ada Alergi', '80', %s, 'Rencana terapi obat jalan', 'Minum obat sesuai resep, hindari aktivitas berlebih', 'Membaik', %s)
                """, (no_rawat, tgl_reg, jam_reg, suhu, tensi, nadi, respirasi, tinggi, berat, spo2, keluhan, diagnosa, kd_dokter))
                
                # 4. Tindakan Medis / Outpatient Treatments
                if random.random() < 0.85:
                    chosen_tindakan = random.choice(tindakans)
                    cursor.execute("""
                        INSERT INTO rawat_jl_dr 
                        (no_rawat, kd_jenis_prw, kd_dokter, tgl_perawatan, jam_rawat, material, bhp, tarif_tindakandr, kso, menejemen, biaya_rawat, stts_bayar)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 5000.0, 2000.0, %s, %s)
                    """, (no_rawat, chosen_tindakan['kd_jenis_prw'], kd_dokter, tgl_reg, jam_reg, chosen_tindakan['material'], chosen_tindakan['bhp'], chosen_tindakan['tarif_tindakandr'], (chosen_tindakan['material'] + chosen_tindakan['bhp'] + chosen_tindakan['tarif_tindakandr']), 'Sudah' if status_bayar == "Sudah Bayar" else 'Belum'))

            # --- D. INPATIENT ADMISSIONS (RAWAT INAP) ---
            kd_bangsal_aktif = 'CL101'
            if stts == "Dirawat":
                chosen_kamar = random.choice(kamars)
                kd_bangsal_aktif = chosen_kamar['kd_bangsal']
                lama_inap = random.randint(1, 5)
                tgl_masuk = datetime.datetime.strptime(tgl_reg, '%Y-%m-%d')
                tgl_keluar = tgl_masuk + datetime.timedelta(days=lama_inap)
                
                cursor.execute("""
                    INSERT INTO kamar_inap 
                    (no_rawat, kd_kamar, trf_kamar, diagnosa_awal, diagnosa_akhir, tgl_masuk, jam_masuk, tgl_keluar, jam_keluar, lama, ttl_biaya, stts_pulang)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (no_rawat, chosen_kamar['kd_kamar'], chosen_kamar['trf_kamar'], diagnosa, diagnosa, tgl_reg, jam_reg, tgl_keluar.strftime('%Y-%m-%d'), jam_reg, float(lama_inap), float(lama_inap * chosen_kamar['trf_kamar']), 'Atas Persetujuan Dokter'))
                
                # CPPT Rawat Inap (Mengisi semua data vital)
                suhu_ip = f"{random.uniform(36.2, 38.0):.1f}"
                tensi_ip = f"{random.randint(110, 125)}/{random.randint(70, 80)}"
                nadi_ip = f"{random.randint(70, 90)}"
                respirasi_ip = f"{random.randint(16, 20)}"
                tinggi_ip = f"{random.randint(155, 178)}"
                berat_ip = f"{random.randint(50, 80)}"
                spo2_ip = f"{random.randint(97, 100)}"
                
                cursor.execute("""
                    INSERT INTO pemeriksaan_ranap 
                    (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi, tinggi, berat, spo2, gcs, kesadaran, keluhan, pemeriksaan, alergi, penilaian, rtl, instruksi, evaluasi, nip)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '15', 'Compos Mentis', 'Lemas, demam naik turun', 'Kondisi klinis cukup stabil', 'Tidak Ada Alergi', %s, 'Observasi infus dan tanda vital', 'Bedrest total, diet rendah garam', 'Evaluasi harian memuaskan', %s)
                """, (no_rawat, tgl_reg, jam_reg, suhu_ip, tensi_ip, nadi_ip, respirasi_ip, tinggi_ip, berat_ip, spo2_ip, diagnosa, kd_dokter))

            # --- E. SURGICAL PROCEDURES (OPERASI) ---
            # Pasien di Poli Bedah (BDS) yang 'Sudah' atau 'Dirawat' memiliki 30% peluang dioperasi
            # Diisi penuh semua kolom biaya dan personil agar tidak null
            if kd_poli == "BDS" and stts in ["Sudah", "Dirawat"] and random.random() < 0.35:
                cursor.execute("""
                    INSERT INTO operasi 
                    (no_rawat, tgl_operasi, jenis_anasthesi, kategori, operator1, operator2, operator3, asisten_operator1, asisten_operator2, asisten_operator3, instrumen, dokter_anak, perawaat_resusitas, dokter_anestesi, asisten_anestesi, asisten_anestesi2, bidan, bidan2, bidan3, perawat_luar, omloop, omloop2, omloop3, omloop4, omloop5, dokter_pjanak, dokter_umum, kode_paket, biayaoperator1, biayaoperator2, biayaoperator3, biayaasisten_operator1, biayaasisten_operator2, biayaasisten_operator3, biayainstrumen, biayadokter_anak, biayaperawaat_resusitas, biayadokter_anestesi, biayaasisten_anestesi, biayaasisten_anestesi2, biayabidan, biayabidan2, biayabidan3, biayaperawat_luar, biayaalat, biayasewaok, akomodasi, bagian_rs, biaya_omloop, biaya_omloop2, biaya_omloop3, biaya_omloop4, biaya_omloop5, biayasarpras, biaya_dokter_pjanak, biaya_dokter_umum, status)
                    VALUES 
                    (%s, %s, 'Spinal', 'Sedang Cito', %s, %s, '-', %s, %s, '-', 'P001', %s, 'P001', %s, 'P001', '-', 'P001', '-', '-', 'P001', 'P001', '-', '-', '-', '-', %s, %s, 'OP001', 1000000.0, 500000.0, 200000.0, 300000.0, 200000.0, 0.0, 150000.0, 500000.0, 200000.0, 800000.0, 400000.0, 0.0, 300000.0, 0.0, 0.0, 150000.0, 500000.0, 600000.0, 200000.0, 1000000.0, 100000.0, 50000.0, 0.0, 0.0, 0.0, 300000.0, 0.0, 200000.0, 'Ralan')
                """, (no_rawat, f"{tgl_reg} 13:00:00", kd_dokter, kd_dokter, kd_dokter, kd_dokter, kd_dokter, kd_dokter, kd_dokter, kd_dokter))

            # --- F. LABORATORY EXAMINATIONS (PENUNJANG MEDIS) ---
            # 40% peluang pasien dirujuk ke laboratorium (Diisi penuh juga biayanya)
            if stts in ["Sudah", "Dirawat"] and random.random() < 0.45:
                chosen_lab = random.choice(labs)
                id_temp = lab_templates[chosen_lab['kd_jenis_prw']]
                cursor.execute("""
                    INSERT INTO periksa_lab 
                    (no_rawat, nip, kd_jenis_prw, tgl_periksa, jam, dokter_perujuk, bagian_rs, bhp, tarif_perujuk, tarif_tindakan_dokter, tarif_tindakan_petugas, kso, menejemen, biaya, kd_dokter, status, kategori)
                    VALUES 
                    (%s, 'P001', %s, %s, %s, %s, %s, %s, %s, %s, %s, 2000, 3000, %s, %s, 'Sudah', %s)
                """, (no_rawat, chosen_lab['kd_jenis_prw'], tgl_reg, jam_reg, kd_dokter, chosen_lab['bagian_rs'], chosen_lab['bhp'], chosen_lab['tarif_perujuk'], chosen_lab['tarif_tindakan_dokter'], chosen_lab['tarif_tindakan_petugas'], chosen_lab['total_byr'], kd_dokter, chosen_lab['kategori']))
                
                # Detail pemeriksaan lab
                cursor.execute("""
                    INSERT INTO detail_periksa_lab 
                    (no_rawat, kd_jenis_prw, tgl_periksa, jam, id_template, nilai, nilai_rujukan, keterangan, bagian_rs, bhp, bagian_perujuk, bagian_dokter, bagian_laborat, kso, menejemen, biaya_item)
                    VALUES 
                    (%s, %s, %s, %s, %s, 'Normal', 'Normal', 'Hasil tes dalam batas wajar', %s, %s, %s, %s, 10000, 2000, 3000, %s)
                """, (no_rawat, chosen_lab['kd_jenis_prw'], tgl_reg, jam_reg, id_temp, chosen_lab['bagian_rs'], chosen_lab['bhp'], chosen_lab['tarif_perujuk'], chosen_lab['tarif_tindakan_dokter'], chosen_lab['total_byr']))

            # --- G. E-PRESCRIPTIONS (RESEP OBAT) ---
            # 80% pasien mendapatkan resep obat
            if stts in ["Sudah", "Dirawat"] and random.random() < 0.80:
                no_resep = f"VRX{i:05d}"
                cursor.execute("""
                    INSERT INTO resep_obat 
                    (no_resep, tgl_perawatan, jam, no_rawat, kd_dokter, tgl_peresepan, jam_peresepan, status, tgl_penyerahan, jam_penyerahan)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 'ralan', %s, %s)
                """, (no_resep, tgl_reg, jam_reg, no_rawat, kd_dokter, tgl_reg, jam_reg, tgl_reg, jam_reg))
                
                num_obats = random.randint(1, 3)
                chosen_obats = random.sample(obats, num_obats)
                for ob in chosen_obats:
                    qty = random.randint(1, 10)
                    cursor.execute("""
                        INSERT INTO resep_dokter (no_resep, kode_brng, jml, aturan_pakai)
                        VALUES (%s, %s, %s, '3 x 1 tablet sesudah makan')
                    """, (no_resep, ob['kode_brng'], qty))
                    
                    biaya_obat = ob['ralan']
                    total_obat = qty * biaya_obat
                    
                    # Simulasikan Apoteker telah memvalidasi dan membagikan obat tersebut
                    # kd_bangsal diisi dengan bangsal aktif jika pasien dirawat
                    cursor.execute("""
                        INSERT INTO detail_pemberian_obat 
                        (tgl_perawatan, jam, no_rawat, kode_brng, h_beli, biaya_obat, jml, embalase, tuslah, total, status, kd_bangsal, no_batch, no_faktur)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, 100, 200, %s, 'Ralan', %s, 'B001', 'F001')
                    """, (tgl_reg, jam_reg, no_rawat, ob['kode_brng'], (biaya_obat/1.2), biaya_obat, float(qty), total_obat, kd_bangsal_aktif))

            # --- H. BILLING & JOURNALING (KASIR & ACCOUNTING BOOKING) ---
            if status_bayar == "Sudah Bayar" and stts in ["Sudah", "Pulang_Paksa"]:
                biaya_registrasi = 15000.0
                
                # 2. Tindakan dokter
                cursor.execute("SELECT SUM(biaya_rawat) as total FROM rawat_jl_dr WHERE no_rawat = %s", (no_rawat,))
                res = cursor.fetchone()
                biaya_tindakan = res['total'] if res and res['total'] else 0.0
                
                # 3. Obat
                cursor.execute("SELECT SUM(total) as total FROM detail_pemberian_obat WHERE no_rawat = %s", (no_rawat,))
                res = cursor.fetchone()
                biaya_obat = res['total'] if res and res['total'] else 0.0
                
                # 4. Lab
                cursor.execute("SELECT SUM(biaya) as total FROM periksa_lab WHERE no_rawat = %s", (no_rawat,))
                res = cursor.fetchone()
                biaya_lab = res['total'] if res and res['total'] else 0.0
                
                # 5. Kamar Inap
                cursor.execute("SELECT SUM(trf_kamar * lama) as total FROM kamar_inap WHERE no_rawat = %s", (no_rawat,))
                res = cursor.fetchone()
                biaya_kamar = res['total'] if res and res['total'] else 0.0
                
                # 6. Operasi
                cursor.execute("SELECT * FROM operasi WHERE no_rawat = %s", (no_rawat,))
                op_records = cursor.fetchall()
                biaya_operasi = 0.0
                for op in op_records:
                    total_op = (op['biayaoperator1'] or 0) + (op['biayaoperator2'] or 0) + (op['biayaoperator3'] or 0) + \
                               (op['biayaasisten_operator1'] or 0) + (op['biayaasisten_operator2'] or 0) + \
                               (op['biayaperawat_luar'] or 0) + (op['biayaalat'] or 0) + (op['biayasewaok'] or 0) + \
                               (op['bagian_rs'] or 0) + (op['biaya_omloop'] or 0)
                    biaya_operasi += total_op
                
                grand_total = biaya_registrasi + biaya_tindakan + biaya_obat + biaya_lab + biaya_kamar + biaya_operasi
                
                # Generate No Nota & No Jurnal
                no_nota = f"VNJ{tgl_reg.replace('-', '')}{i:03d}"
                no_jurnal = f"VJR{tgl_reg.replace('-', '')[2:]}{i:04d}"
                
                # A. Nota Jalan
                cursor.execute("""
                    INSERT INTO nota_jalan (no_rawat, no_nota, tanggal, jam)
                    VALUES (%s, %s, %s, %s)
                """, (no_rawat, no_nota, tgl_reg, jam_reg))
                
                if grand_total > 0:
                    # B. Jurnal Header
                    cursor.execute("""
                        INSERT INTO jurnal (no_jurnal, no_bukti, tgl_jurnal, jam_jurnal, jenis, keterangan)
                        VALUES (%s, %s, %s, %s, 'U', %s)
                    """, (no_jurnal, no_nota, tgl_reg, jam_reg, f"Pembayaran Pasien Rawat Jalan {nm_pasien} ({no_rawat})"))
                    
                    # C. Jurnal Detail: Debit KAS KASIR (111010)
                    cursor.execute("""
                        INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                        VALUES (%s, '111010', %s, 0)
                    """, (no_jurnal, grand_total))
                    
                    # D. Jurnal Detail: Kredit Pendapatan
                    if biaya_registrasi > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420101', 0, %s)
                        """, (no_jurnal, biaya_registrasi))
                        
                    if biaya_tindakan > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420100', 0, %s)
                        """, (no_jurnal, biaya_tindakan))
                        
                    if biaya_obat > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420108', 0, %s)
                        """, (no_jurnal, biaya_obat))
                        
                    if biaya_lab > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420109', 0, %s)
                        """, (no_jurnal, biaya_lab))
                        
                    if biaya_kamar > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420102', 0, %s)
                        """, (no_jurnal, biaya_kamar))
                        
                    if biaya_operasi > 0:
                        cursor.execute("""
                            INSERT INTO detailjurnal (no_jurnal, kd_rek, debet, kredit)
                            VALUES (%s, '420104', 0, %s)
                        """, (no_jurnal, biaya_operasi))

            # Tambahkan ke riwayat_barang_medis (Mutasi) agar datanya tidak kosong
            if stts in ["Sudah", "Dirawat"]:
                # Insert barang keluar
                for ob in chosen_obats:
                    qty = random.randint(1, 5)
                    cursor.execute("""
                        INSERT INTO riwayat_barang_medis 
                        (kode_brng, stok_awal, masuk, keluar, stok_akhir, posisi, tanggal, jam, petugas, kd_bangsal, status, no_batch, no_faktur, keterangan)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        ob['kode_brng'],
                        100.0,
                        0.0,
                        float(qty),
                        100.0 - float(qty),
                        'Apotek',
                        tgl_reg,
                        jam_reg,
                        'P001',
                        kd_bangsal_aktif,
                        'Ralan',
                        'B001',
                        'F001',
                        f"Penjualan Resep {no_resep}"
                    ))

            success_count += 1
            if i % 100 == 0:
                print(f"  [>] {i}/500 Pasien (ZERO-NULL) berhasil di-generate.")

        # Komit perubahan data ke database
        conn.commit()
        print(f"\n✅ SUKSES MUTLAK: {success_count} Alur Kunjungan Pasien (ZERO-NULL) berhasil ditambahkan ke database!")
        print("Pengujian dengan skenario 100% data terisi (Tanpa kolom null di relasi utama) SELESAI.")

    except mysql.connector.Error as err:
        print(f"❌ Error MySQL: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_500_varied_simulation()
