import mysql.connector
from db_config import auth_keys, connection_config

def simulate_login(username_input, password_input):
    print(f"--- Memulai Simulasi Login Modul 0 ---")
    print(f"Target Input Username : {username_input}")
    
    try:
        conn = mysql.connector.connect(**connection_config())
        cursor = conn.cursor(dictionary=True)
        username_key, password_key = auth_keys()
        query = """
        SELECT 
            CAST(AES_DECRYPT(usere, %s) AS CHAR) as decoded_username,
            CAST(AES_DECRYPT(passworde, %s) AS CHAR) as decoded_password
        FROM admin
        WHERE AES_DECRYPT(usere, %s) = %s
        """
        
        cursor.execute(query, (username_key, password_key, username_key, username_input))
        result = cursor.fetchone()
        
        if result:
            print(f"[SUCCESS] User ditemukan di database admin!")
            
            # Cocokkan password
            if result['decoded_password'] == password_input:
                print(f"[SUCCESS] Autentikasi Berhasil! Password cocok.")
                return True
            else:
                print("[FAILED] Autentikasi Gagal! Password salah.")
                return False
        else:
            print(f"[FAILED] User '{username_input}' tidak ditemukan.")
            return False
            
    except mysql.connector.Error as err:
        print(f"[ERROR] Database error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    print("Menjalankan Uji Coba Logic (Jupyter Notebook Mode)...\n")
    simulate_login(input("Username uji: "), input("Password uji: "))
    print("\nSimulasi Selesai.")
