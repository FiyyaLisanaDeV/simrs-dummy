import mysql.connector
import datetime
from db_config import connection_config

def run_simulation():
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)

    print("=== Memulai Simulasi Modul 5: Kasir & Billing ===")
    
    try:
        # Skenario 1: Menarik Tagihan On-the-fly
        # Kita pakai salah satu no_rawat pasien yang ada di database.
        # Misal: 2026/02/25/000005 (Dari simulasi CPPT rawat_jl_dr)
        no_rawat = '2026/02/25/000005'
        print(f"\n[Skenario 1] Menarik Agregasi Tagihan untuk No Rawat: {no_rawat}")
        
        # 1.a Ambil Biaya Registrasi
        cursor.execute("SELECT biaya_reg, status_bayar FROM reg_periksa WHERE no_rawat = %s", (no_rawat,))
        reg_data = cursor.fetchone()
        biaya_reg = reg_data['biaya_reg'] if reg_data else 0
        print(f"  [-] Biaya Registrasi/Administrasi : Rp {biaya_reg:,.2f}")
        
        # 1.b Ambil Biaya Tindakan Dokter (rawat_jl_dr)
        cursor.execute("SELECT SUM(biaya_rawat) as total_tindakan FROM rawat_jl_dr WHERE no_rawat = %s AND stts_bayar = 'Belum'", (no_rawat,))
        tindakan_data = cursor.fetchone()
        biaya_tindakan = tindakan_data['total_tindakan'] if tindakan_data and tindakan_data['total_tindakan'] else 0
        print(f"  [-] Biaya Tindakan Dokter/Medis   : Rp {biaya_tindakan:,.2f}")
        
        # 1.c Ambil Biaya Obat (detail_pemberian_obat)
        cursor.execute("SELECT SUM(total) as total_obat FROM detail_pemberian_obat WHERE no_rawat = %s", (no_rawat,))
        obat_data = cursor.fetchone()
        biaya_obat = obat_data['total_obat'] if obat_data and obat_data['total_obat'] else 0
        print(f"  [-] Biaya Obat & Farmasi          : Rp {biaya_obat:,.2f}")
        
        # Grand Total
        grand_total = biaya_reg + biaya_tindakan + biaya_obat
        print(f"  [=] GRAND TOTAL TAGIHAN           : Rp {grand_total:,.2f}")

        # Skenario 2: Simulasi Pembayaran (Checkout)
        print("\n[Skenario 2] Eksekusi Pembayaran Kasir (Dry-Run)")
        now = datetime.datetime.now()
        tgl = now.strftime('%Y-%m-%d')
        jam = now.strftime('%H:%M:%S')
        no_nota = f"RJ{now.strftime('%Y%m%d')}001" # Contoh format nota rawat jalan (RJ)
        
        # 2.a INSERT Nota
        cursor.execute("""
            INSERT INTO nota_jalan (no_rawat, no_nota, tanggal, jam)
            VALUES (%s, %s, %s, %s)
        """, (no_rawat, no_nota, tgl, jam))
        print(f"  ✅ INSERT tabel `nota_jalan` berhasil ({no_nota})")
        
        # 2.b UPDATE Status Bayar di Pendaftaran
        cursor.execute("""
            UPDATE reg_periksa SET status_bayar = 'Sudah Bayar' WHERE no_rawat = %s
        """, (no_rawat,))
        print("  ✅ UPDATE tabel `reg_periksa.status_bayar` = 'Sudah Bayar' berhasil")
        
        # 2.c UPDATE Status Bayar di Tindakan
        cursor.execute("""
            UPDATE rawat_jl_dr SET stts_bayar = 'Sudah' WHERE no_rawat = %s
        """, (no_rawat,))
        print("  ✅ UPDATE tabel `rawat_jl_dr.stts_bayar` = 'Sudah' berhasil")
        
        # Mengakhiri dengan Rollback untuk menjaga data asli SIMRS Dummy
        conn.rollback()
        print("\n✅ Seluruh Constraint Lolos! Transaksi berhasil di-*rollback* agar data aman.")

    except mysql.connector.Error as err:
        print(f"❌ Error MySQL: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        print("=== Simulasi Modul 5 SELESAI ===\n")

if __name__ == "__main__":
    run_simulation()
