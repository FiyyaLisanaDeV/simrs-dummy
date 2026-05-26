import urllib.request
import json
import mysql.connector
from db_config import connection_config

no_rawat = "2026-02-23-000001"
url_get = f"http://localhost:4000/kasir/tagihan/{no_rawat}"
url_pay = f"http://localhost:4000/kasir/bayar"

print(f"Fetching bill for {no_rawat}...")
try:
    req = urllib.request.Request(url_get)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        grandTotal = data['grandTotal']
        print(f"Bill retrieved: {grandTotal}")
        
    print("Paying the bill...")
    payload = json.dumps({"no_rawat": no_rawat, "nominal_bayar": grandTotal}).encode()
    req_pay = urllib.request.Request(url_pay, data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_pay) as response:
        pay_result = json.loads(response.read().decode())
        print(f"Payment successful: {pay_result}")
        no_nota = pay_result['no_nota']
        
    # Check Database
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor(dictionary=True)
    
    print("\n--- HONEST CLEAN & CLEAR CHECK ---")
    cursor.execute(f"SELECT * FROM nota_jalan WHERE no_nota = '{no_nota}'")
    print("Nota Jalan:", cursor.fetchone())
    
    cursor.execute(f"SELECT * FROM jurnal WHERE no_bukti = '{no_nota}'")
    jurnal = cursor.fetchone()
    print("Jurnal Akuntansi:", jurnal)
    
    if jurnal:
        no_jurnal = jurnal['no_jurnal']
        cursor.execute(f"SELECT * FROM detailjurnal WHERE no_jurnal = '{no_jurnal}'")
        detail = cursor.fetchall()
        print(f"Detail Jurnal ({len(detail)} rows):")
        total_debit = 0
        total_kredit = 0
        for d in detail:
            print(f" - Rekening: {d['kd_rek']}, Debit: {d['debet']}, Kredit: {d['kredit']}")
            total_debit += d['debet']
            total_kredit += d['kredit']
        print(f"Total Debit: {total_debit}, Total Kredit: {total_kredit}")
        if total_debit == total_kredit:
            print("STATUS: BALANCE (OK)")
        else:
            print("STATUS: IMBALANCE (ERROR!)")
            
    # Check Mutasi Barang
    cursor.execute(f"SELECT * FROM riwayat_barang_medis WHERE keterangan LIKE '%Resep%' OR keterangan LIKE '%Racikan%' ORDER BY jam DESC LIMIT 5")
    riwayat = cursor.fetchall()
    print("\nRiwayat Barang Medis (Mutasi Gudang):")
    for r in riwayat:
        print(f" - {r['kode_brng']} | Keluar: {r['keluar']} | {r['keterangan']}")
        
    conn.close()

except Exception as e:
    print("Error:", e)
