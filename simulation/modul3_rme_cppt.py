import mysql.connector
from datetime import datetime
from db_config import connection_config

def test_rme_cppt():
    print("=== Memulai Simulasi Modul 3: Rekam Medis Elektronik (RME / CPPT) ===")

    try:
        conn = mysql.connector.connect(**connection_config())
        cursor = conn.cursor(dictionary=True)

        # =============================================
        # SKENARIO 1: Menarik riwayat SOAP / CPPT pasien (pemeriksaan_ralan)
        # =============================================
        print("\n[Skenario 1] Riwayat CPPT Rawat Jalan (pemeriksaan_ralan)")
        query_soap = """
            SELECT pr.no_rawat, pr.tgl_perawatan, pr.jam_rawat,
                   pr.keluhan AS subjective,
                   pr.pemeriksaan AS objective,
                   pr.penilaian AS assessment,
                   pr.rtl AS plan,
                   pr.kesadaran, pr.tensi, pr.nadi, pr.suhu_tubuh, pr.respirasi,
                   pr.instruksi, pr.evaluasi,
                   p.nm_pasien
            FROM pemeriksaan_ralan pr
            JOIN reg_periksa rp ON pr.no_rawat = rp.no_rawat
            JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
            ORDER BY pr.tgl_perawatan DESC, pr.jam_rawat DESC
            LIMIT 5
        """
        cursor.execute(query_soap)
        soaps = cursor.fetchall()

        if soaps:
            for s in soaps:
                print(f"\n  Pasien: {s['nm_pasien']} | No Rawat: {s['no_rawat']}")
                print(f"  Tanggal: {s['tgl_perawatan']} {s['jam_rawat']}")
                print(f"  [S] Keluhan   : {(s['subjective'] or '-')[:80]}")
                print(f"  [O] Periksa   : {(s['objective'] or '-')[:80]}")
                print(f"  [A] Penilaian : {(s['assessment'] or '-')[:80]}")
                print(f"  [P] Rencana   : {(s['plan'] or '-')[:80]}")
                print(f"  Vital: TD={s['tensi']} N={s['nadi']} S={s['suhu_tubuh']} R={s['respirasi']} Kes={s['kesadaran']}")
        else:
            print("  (Tidak ada data pemeriksaan ralan)")

        # =============================================
        # SKENARIO 2: Menarik riwayat CPPT Rawat Inap (pemeriksaan_ranap)
        # =============================================
        print("\n\n[Skenario 2] Riwayat CPPT Rawat Inap (pemeriksaan_ranap)")
        query_ranap = """
            SELECT pr.no_rawat, pr.tgl_perawatan, pr.jam_rawat,
                   pr.keluhan AS subjective,
                   pr.pemeriksaan AS objective,
                   pr.penilaian AS assessment,
                   pr.rtl AS plan,
                   pr.kesadaran, pr.tensi,
                   p.nm_pasien
            FROM pemeriksaan_ranap pr
            JOIN reg_periksa rp ON pr.no_rawat = rp.no_rawat
            JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
            ORDER BY pr.tgl_perawatan DESC, pr.jam_rawat DESC
            LIMIT 3
        """
        cursor.execute(query_ranap)
        ranaps = cursor.fetchall()

        if ranaps:
            for r in ranaps:
                print(f"\n  Pasien: {r['nm_pasien']} | No Rawat: {r['no_rawat']}")
                print(f"  Tanggal: {r['tgl_perawatan']} {r['jam_rawat']}")
                print(f"  [S] {(r['subjective'] or '-')[:80]}")
                print(f"  [O] {(r['objective'] or '-')[:80]}")
                print(f"  [A] {(r['assessment'] or '-')[:80]}")
                print(f"  [P] {(r['plan'] or '-')[:80]}")
        else:
            print("  (Tidak ada data pemeriksaan ranap)")

        # =============================================
        # SKENARIO 3: Menarik Diagnosa ICD-10 pasien
        # =============================================
        print("\n\n[Skenario 3] Diagnosa ICD-10 Pasien (diagnosa_pasien)")
        query_diag = """
            SELECT dp.no_rawat, dp.kd_penyakit, py.nm_penyakit, dp.status, dp.prioritas, dp.status_penyakit,
                   p.nm_pasien
            FROM diagnosa_pasien dp
            JOIN penyakit py ON dp.kd_penyakit = py.kd_penyakit
            JOIN reg_periksa rp ON dp.no_rawat = rp.no_rawat
            JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
            LIMIT 5
        """
        cursor.execute(query_diag)
        diagnoses = cursor.fetchall()

        if diagnoses:
            for d in diagnoses:
                print(f"  {d['nm_pasien']} | {d['kd_penyakit']} - {d['nm_penyakit']} | Prioritas: {d['prioritas']} | {d['status']} | {d['status_penyakit']}")
        else:
            print("  (Tidak ada data diagnosa)")

        # =============================================
        # SKENARIO 4: Menarik Tindakan/Perawatan Pasien (rawat_jl_dr)
        # =============================================
        print("\n\n[Skenario 4] Riwayat Tindakan Dokter Rawat Jalan (rawat_jl_dr)")
        query_tindakan = """
            SELECT rj.no_rawat, rj.kd_jenis_prw, jp.nm_perawatan, rj.biaya_rawat,
                   rj.tgl_perawatan, rj.jam_rawat, rj.stts_bayar,
                   p.nm_pasien
            FROM rawat_jl_dr rj
            JOIN jns_perawatan jp ON rj.kd_jenis_prw = jp.kd_jenis_prw
            JOIN reg_periksa rp ON rj.no_rawat = rp.no_rawat
            JOIN pasien p ON rp.no_rkm_medis = p.no_rkm_medis
            LIMIT 5
        """
        cursor.execute(query_tindakan)
        tindakans = cursor.fetchall()

        if tindakans:
            for t in tindakans:
                print(f"  {t['nm_pasien']} | {t['nm_perawatan']} | Rp{t['biaya_rawat']:,.0f} | {t['stts_bayar']} | {t['tgl_perawatan']}")
        else:
            print("  (Tidak ada data tindakan)")

        # =============================================
        # SKENARIO 5: Simulasi INSERT SOAP baru (Dry-Run + Rollback)
        # =============================================
        print("\n\n[Skenario 5] Simulasi INSERT SOAP Baru ke pemeriksaan_ralan (Dry-Run)")

        # Cari no_rawat yang valid untuk testing
        cursor.execute("SELECT no_rawat FROM reg_periksa ORDER BY no_rawat DESC LIMIT 1")
        last_reg = cursor.fetchone()
        if last_reg:
            test_no_rawat = last_reg['no_rawat']
            now = datetime.now()

            insert_soap = """
                INSERT INTO pemeriksaan_ralan
                (no_rawat, tgl_perawatan, jam_rawat, suhu_tubuh, tensi, nadi, respirasi,
                 tinggi, berat, spo2, gcs, kesadaran, keluhan, pemeriksaan, alergi,
                 lingkar_perut, rtl, penilaian, instruksi, evaluasi, nip)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            vals = (
                test_no_rawat, now.strftime('%Y-%m-%d'), now.strftime('%H:%M:%S'),
                '36.5', '120/80', '80', '20',
                '170', '65', '98', 'E4V5M6', 'Compos Mentis',
                'Demam 3 hari, batuk berdahak', 'Pharynx hiperemis, T 36.5C',
                'Tidak ada', '85',
                'Paracetamol 3x500mg, kontrol 3 hari', 'Pharyngitis akut',
                'Istirahat cukup, banyak minum', 'Evaluasi 3 hari',
                'D0000002' # NIP petugas dari tabel pegawai (dr. Aisyah)
            )
            cursor.execute(insert_soap, vals)
            print(f"  ✅ INSERT SOAP berhasil ke pemeriksaan_ralan untuk no_rawat={test_no_rawat}")

            # Rollback
            conn.rollback()
            print("  ✅ Rollback berhasil. Data asli tetap aman.")
        else:
            print("  ⚠️ Tidak ada no_rawat untuk testing.")

        # =============================================
        # SKENARIO 6: Simulasi INSERT Diagnosa ICD-10 (Dry-Run + Rollback)
        # =============================================
        print("\n[Skenario 6] Simulasi INSERT Diagnosa ICD-10 (Dry-Run)")
        if last_reg:
            insert_diag = """
                INSERT INTO diagnosa_pasien (no_rawat, kd_penyakit, status, prioritas, status_penyakit)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_diag, (test_no_rawat, 'J02.9', 'Ralan', 1, 'Baru'))
            print(f"  ✅ INSERT diagnosa J02.9 (Acute pharyngitis, unspecified) berhasil untuk {test_no_rawat}")

            conn.rollback()
            print("  ✅ Rollback berhasil. Data asli tetap aman.")

        print("\n=== Simulasi Modul 3 SELESAI ===")

    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    test_rme_cppt()
