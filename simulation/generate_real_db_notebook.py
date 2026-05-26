import nbformat as nbf

nb = nbf.v4.new_notebook()

text_intro = """\
# 🏥 SIMRS Dummy: Real Database Logic Simulation
Notebook ini terhubung langsung ke database bawaan `sik` (SIMRS Dummy MySQL).
Kita akan mengambil data asli dari tabel-tabel bawaan (Pasien, Poli, Obat) dan mensimulasikan logika bisnis secara langsung!
"""

code_setup = """\
import os
import pandas as pd
from sqlalchemy import create_engine

print("Membuka Koneksi ke Database SIMRS Dummy (sik)...")
engine = create_engine(os.environ['DATABASE_URL'])
conn = engine.connect()

print("✅ Koneksi Berhasil!")
"""

code_pasien = """\
print("--- 1. MASTER DATA PASIEN & POLIKLINIK ---")
# Mengambil 5 pasien teratas dari database asli
df_pasien = pd.read_sql("SELECT no_rkm_medis, nm_pasien, no_ktp, tgl_lahir FROM pasien LIMIT 5", conn)
print("Data Pasien Bawaan (Tabel: pasien):")
display(df_pasien)

# Mengambil 5 poliklinik teratas
df_poli = pd.read_sql("SELECT kd_poli, nm_poli, registrasi FROM poliklinik WHERE status='1' LIMIT 5", conn)
print("\\nData Poliklinik Aktif (Tabel: poliklinik):")
display(df_poli)
"""

code_reg = """\
from datetime import datetime

print("--- 2. SIMULASI PENDAFTARAN PASIEN ---")
# Kita ambil pasien pertama dan poli pertama
if not df_pasien.empty and not df_poli.empty:
    no_rm = df_pasien.iloc[0]['no_rkm_medis']
    nama = df_pasien.iloc[0]['nm_pasien']
    kd_poli = df_poli.iloc[0]['kd_poli']
    nm_poli = df_poli.iloc[0]['nm_poli']
    biaya_reg = df_poli.iloc[0]['registrasi']
    
    no_rawat = f"{datetime.now().strftime('%Y/%m/%d')}/000001"
    
    print(f"Mensimulasikan pendaftaran untuk: {nama} (RM: {no_rm})")
    print(f"Tujuan: {nm_poli}")
    print(f"No Rawat Generated: {no_rawat}")
    print(f"Biaya Pendaftaran: Rp {biaya_reg}")
    
    # Dalam implementasi asli, ini akan di-INSERT ke tabel reg_periksa
    print("\\n[SIMULASI] INSERT INTO reg_periksa (no_rawat, tgl_registrasi, no_rkm_medis, kd_poli, stts, biaya_reg) ...")
else:
    print("Data kosong, tidak bisa simulasi.")
"""

code_farmasi = """\
print("--- 3. SIMULASI FARMASI & E-RESEP ---")
# Mengambil 5 obat dari databarang (harga jual rawat jalan menggunakan kolom 'ralan')
df_obat = pd.read_sql("SELECT kode_brng, nama_brng, stokminimal, h_beli, ralan as h_jual FROM databarang WHERE status='1' LIMIT 5", conn)
print("Katalog Obat Bawaan (Tabel: databarang):")
display(df_obat)

if not df_obat.empty:
    kd_obat = df_obat.iloc[0]['kode_brng']
    nm_obat = df_obat.iloc[0]['nama_brng']
    harga = df_obat.iloc[0]['h_jual']
    qty = 10
    total = harga * qty
    
    print(f"\\nDokter Meresepkan: {nm_obat} x {qty}")
    print(f"Total Biaya Obat: Rp {total}")
    print("\\n[SIMULASI] UPDATE databarang SET stok = stok - 10 WHERE kode_brng = ...")
"""

nb.cells = [
    nbf.v4.new_markdown_cell(text_intro),
    nbf.v4.new_code_cell(code_setup),
    nbf.v4.new_code_cell(code_pasien),
    nbf.v4.new_code_cell(code_reg),
    nbf.v4.new_code_cell(code_farmasi)
]

with open('simrs_real_db_simulation.ipynb', 'w') as f:
    nbf.write(nb, f)
    
print("Berhasil membuat file simrs_real_db_simulation.ipynb")
