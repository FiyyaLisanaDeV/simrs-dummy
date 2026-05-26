import mysql.connector
import json
import os
from db_config import connection_config

tables_to_dump = [
    'jurnal',
    'detailjurnal',
    'riwayat_barang_medis',
    'mutasi_barang',
    'diagnosa_pasien',
    'bridging_sep',
    'user',
    'pegawai'
]

output = {}

try:
    conn = mysql.connector.connect(**connection_config())
    cursor = conn.cursor()
    
    for table in tables_to_dump:
        try:
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            output[table] = [{"field": c[0], "type": c[1]} for c in columns]
        except Exception as e:
            output[table] = {"error": str(e)}

    output_path = os.getenv('SIMRS_SCHEMA_DUMP_PATH', '/tmp/simrs_schema_dump.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=4)
        
    print("Schema dumped successfully.")
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close()
