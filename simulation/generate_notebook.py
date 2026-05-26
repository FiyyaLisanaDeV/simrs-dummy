import nbformat as nbf

# Buat objek notebook baru
nb = nbf.v4.new_notebook()

# Tambahkan Judul dan Penjelasan
text_intro = """\
# 🏥 SIMRS-Web: Simulasi Logika Bisnis & Skema Relasional
Notebook ini digunakan untuk menguji coba model relasional data (Pasien, Registrasi, Tindakan, Obat, Billing) serta memvalidasi algoritma agregasi tagihan sebelum kita menerjemahkannya ke dalam Prisma ORM & NestJS.

**Alur yang akan disimulasikan:**
1. Pendaftaran Pasien (Front Office)
2. Asesmen Perawat & Pemeriksaan Dokter (RME)
3. Order E-Resep & Pengurangan Stok (Farmasi)
4. Agregasi Tagihan Akhir (Kasir)
"""

# Cell 1: Definisi Mock Database (Struktur Data)
code_db = """\
import pandas as pd
from datetime import datetime
import json

print("Inisialisasi Mock Database SIMRS...")

# 1. Tabel Master
mock_db = {
    "patients": [
        {"id": "RM-000001", "name": "Budi Santoso", "dob": "1980-05-15", "insurance_type": "BPJS"},
        {"id": "RM-000002", "name": "Siti Aminah", "dob": "1992-10-20", "insurance_type": "UMUM"}
    ],
    "clinics": [
        {"id": "POL-PD", "name": "Poli Penyakit Dalam", "base_fee": 150000},
        {"id": "IGD", "name": "Instalasi Gawat Darurat", "base_fee": 250000}
    ],
    "medicines": [
        {"id": "MED-001", "name": "Paracetamol 500mg", "stock": 1000, "price": 5000},
        {"id": "MED-002", "name": "Amoxicillin", "stock": 500, "price": 12000}
    ],
    # Tabel Transaksi
    "registrations": [],
    "medical_records": [],
    "prescriptions": [],
    "invoices": []
}

def show_tables():
    print(f"Pasien Terdaftar: {len(mock_db['patients'])}")
    print(f"Total Obat di Apotek: {len(mock_db['medicines'])}")

show_tables()
"""

# Cell 2: Modul Pendaftaran
code_registration = """\
def register_patient(patient_id, clinic_id, visit_type):
    patient = next((p for p in mock_db["patients"] if p["id"] == patient_id), None)
    clinic = next((c for c in mock_db["clinics"] if c["id"] == clinic_id), None)
    
    if not patient or not clinic:
        return "Error: Pasien atau Poli tidak ditemukan"
        
    reg_id = f"REG-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    registration = {
        "reg_id": reg_id,
        "patient_id": patient_id,
        "clinic_id": clinic_id,
        "visit_type": visit_type,
        "status": "WAITING_EXAM",
        "timestamp": datetime.now().isoformat()
    }
    
    mock_db["registrations"].append(registration)
    print(f"✅ Berhasil mendaftar! No Registrasi: {reg_id} | Poli: {clinic['name']}")
    return reg_id

# Simulasi: Siti Aminah mendaftar ke Poli Penyakit Dalam (Rawat Jalan)
reg_id_siti = register_patient("RM-000002", "POL-PD", "OUTPATIENT")
"""

# Cell 3: Modul Pelayanan (RME & SOAP)
code_rme = """\
def doctor_examination(reg_id, subjective, objective, assessment, plan, icd10_code):
    reg = next((r for r in mock_db["registrations"] if r["reg_id"] == reg_id), None)
    if not reg: return "Error: Registrasi tidak valid"
    
    record = {
        "rme_id": f"RME-{reg_id}",
        "reg_id": reg_id,
        "soap": {
            "S": subjective,
            "O": objective,
            "A": assessment,
            "P": plan
        },
        "icd10": icd10_code
    }
    mock_db["medical_records"].append(record)
    
    # Update status registrasi
    reg["status"] = "EXAMINED"
    print(f"🩺 RME Disimpan untuk Registrasi {reg_id} (Diagnosis: {icd10_code})")

# Simulasi: Dokter memeriksa Siti Aminah
doctor_examination(reg_id_siti, 
                  "Demam 3 hari", 
                  "Suhu 39C, Tensi 120/80", 
                  "Typhoid Fever", 
                  "Istirahat, berikan paracetamol & antibiotik", 
                  "A01.0")
"""

# Cell 4: Modul Farmasi (E-Resep & Dispensing)
code_pharmacy = """\
def create_prescription(reg_id, items):
    # items format: [{"med_id": "MED-001", "qty": 10}]
    rx_id = f"RX-{reg_id}"
    prescription = {
        "rx_id": rx_id,
        "reg_id": reg_id,
        "items": [],
        "total_medicine_cost": 0,
        "status": "DISPENSED"
    }
    
    for req in items:
        med = next((m for m in mock_db["medicines"] if m["id"] == req["med_id"]), None)
        if med and med["stock"] >= req["qty"]:
            # Kurangi stok
            med["stock"] -= req["qty"]
            cost = med["price"] * req["qty"]
            
            prescription["items"].append({
                "med_id": req["med_id"],
                "name": med["name"],
                "qty": req["qty"],
                "subtotal": cost
            })
            prescription["total_medicine_cost"] += cost
        else:
            print(f"⚠️ Stok tidak cukup untuk obat {req['med_id']}")
            
    mock_db["prescriptions"].append(prescription)
    print(f"💊 Resep Dibuat! Total Biaya Obat: Rp {prescription['total_medicine_cost']}")
    
create_prescription(reg_id_siti, [
    {"med_id": "MED-001", "qty": 10}, 
    {"med_id": "MED-002", "qty": 15}
])

print("\\nSisa Stok Obat Saat Ini:")
for m in mock_db["medicines"]:
    print(f"- {m['name']}: {m['stock']} unit")
"""

# Cell 5: Modul Kasir (Billing Aggregation)
code_billing = """\
def generate_invoice(reg_id):
    reg = next((r for r in mock_db["registrations"] if r["reg_id"] == reg_id), None)
    clinic = next((c for c in mock_db["clinics"] if c["id"] == reg["clinic_id"]), None)
    rx = next((p for p in mock_db["prescriptions"] if p["reg_id"] == reg_id), None)
    
    invoice = {
        "inv_id": f"INV-{reg_id}",
        "reg_id": reg_id,
        "details": {
            "doctor_fee": clinic["base_fee"],
            "medicine_fee": rx["total_medicine_cost"] if rx else 0,
            "lab_fee": 0
        }
    }
    invoice["grand_total"] = sum(invoice["details"].values())
    
    mock_db["invoices"].append(invoice)
    
    # Update status kunjungan jadi selesai
    reg["status"] = "DISCHARGED"
    
    print("========================================")
    print(f"🧾 INVOICE TAGIHAN RUMAH SAKIT")
    print(f"ID Invoice: {invoice['inv_id']}")
    print("----------------------------------------")
    print(f"1. Tarif Tindakan/Poli : Rp {invoice['details']['doctor_fee']}")
    print(f"2. Biaya Obat/Farmasi  : Rp {invoice['details']['medicine_fee']}")
    print("----------------------------------------")
    print(f"TOTAL TAGIHAN          : Rp {invoice['grand_total']}")
    print("========================================")
    
    return invoice

generate_invoice(reg_id_siti)
"""

nb.cells = [
    nbf.v4.new_markdown_cell(text_intro),
    nbf.v4.new_code_cell(code_db),
    nbf.v4.new_markdown_cell("## 1. Registrasi Pasien (Modul 2)"),
    nbf.v4.new_code_cell(code_registration),
    nbf.v4.new_markdown_cell("## 2. Pemeriksaan Dokter (Modul 3)"),
    nbf.v4.new_code_cell(code_rme),
    nbf.v4.new_markdown_cell("## 3. Apotek & Dispensing (Modul 4)"),
    nbf.v4.new_code_cell(code_pharmacy),
    nbf.v4.new_markdown_cell("## 4. Agregator Tagihan / Kasir (Modul 5)"),
    nbf.v4.new_code_cell(code_billing)
]

with open('simrs_logic_simulation.ipynb', 'w') as f:
    nbf.write(nb, f)
    
print("Berhasil membuat file simrs_logic_simulation.ipynb")
