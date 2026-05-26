import re

with open("prisma/schema.prisma", "r") as f:
    schema = f.read()

# Replace the broken paket_operasi block
broken_pattern = re.compile(r"model paket_operasi \{.*?\n\}", re.DOTALL)

clean_paket_operasi = """model paket_operasi {
  kode_paket                    String                          @id @db.VarChar(15)
  nm_perawatan                  String                          @db.VarChar(80)
  kategori                      paket_operasi_kategori?
  operator1                     Float
  operator2                     Float
  operator3                     Float
  asisten_operator1             Float?
  asisten_operator2             Float
  asisten_operator3             Float?
  instrumen                     Float?
  dokter_anak                   Float
  perawaat_resusitas            Float
  dokter_anestesi               Float
  asisten_anestesi              Float
  asisten_anestesi2             Float?
  bidan                         Float
  bidan2                        Float?
  bidan3                        Float?
  perawat_luar                  Float
  sewa_ok                       Float
  alat                          Float
  akomodasi                     Float?
  bagian_rs                     Float
  omloop                        Float
  omloop2                       Float?
  omloop3                       Float?
  omloop4                       Float?
  omloop5                       Float?
  sarpras                       Float?
  dokter_pjanak                 Float?
  dokter_umum                   Float?
  kd_pj                         String?                         @db.Char(3)
  status                        paket_operasi_status?
  kelas                         paket_operasi_kelas?

  operasi                       operasi[]
}"""

schema = broken_pattern.sub(clean_paket_operasi, schema)

# Append simrs_web_sequence_tracker if not exists
tracker_model = """
model simrs_web_sequence_tracker {
  scope       String   @db.VarChar(50)
  period_key  String   @db.VarChar(20)
  last_number Int      @default(0)
  updated_at  DateTime @updatedAt

  @@id([scope, period_key])
}
"""
if "model simrs_web_sequence_tracker" not in schema:
    schema += tracker_model

with open("prisma/schema.prisma", "w") as f:
    f.write(schema)

print("Schema fixed successfully!")
