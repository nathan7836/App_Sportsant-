
import paramiko
import time

def verify_storage():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    remote_dir = "/root/homecare"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("✅ Connecté via SSH.\n")
        
        # Check dev.db details
        print("--- VÉRIFICATION DU FICHIER DB ---")
        stdin, stdout, stderr = client.exec_command(f"ls -l {remote_dir}/dev.db")
        print(stdout.read().decode().strip())
        
        # Check backup existence
        print("\n--- VÉRIFICATION DU BACKUP (/tmp) ---")
        stdin, stdout, stderr = client.exec_command("ls -l /tmp/dev.db.backup")
        print(stdout.read().decode().strip())
        
        # Check if DB is empty (sqlite3 might not be installed, but we can check size)
        # An empty prisma DB is usually around 24KB-64KB depending on schema complexity.
        # If it's larger, it likely has data.
        
        # Check Uploads folder
        print("\n--- VÉRIFICATION DES UPLOADS ---")
        stdin, stdout, stderr = client.exec_command(f"ls -ld {remote_dir}/public/uploads")
        print(stdout.read().decode().strip())
        stdin, stdout, stderr = client.exec_command(f"ls -l {remote_dir}/public/uploads | head -n 5")
        print(stdout.read().decode().strip())

    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    verify_storage()
