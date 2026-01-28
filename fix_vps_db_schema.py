
import paramiko
import os
import subprocess
import shutil

# Configuration
VPS_IP = "82.165.195.155"
VPS_USER = "root"
VPS_PASSWORD = "Tl7Z7Wfa"
REMOTE_DB_PATH = "/root/homecare/dev.db"
LOCAL_DB_PATH = "prisma/dev.db" # Standard prisma location

def run_local_command(command):
    try:
        print(f"--> Local Exec: {command}")
        subprocess.run(command, shell=True, check=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Local command failed: {e}")
        return False

def fix_db_schema():
    print("=== Fixing VPS Database Schema (Download/Migrate/Upload) ===")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"--> Connecting to {VPS_IP}...")
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD)
        sftp = ssh.open_sftp()
        
        # 1. Download DB
        print(f"--> Downloading {REMOTE_DB_PATH} to {LOCAL_DB_PATH}...")
        # Backup local db if exists just in case
        if os.path.exists(LOCAL_DB_PATH):
            shutil.copy(LOCAL_DB_PATH, f"{LOCAL_DB_PATH}.bak")
        
        try:
            sftp.get(REMOTE_DB_PATH, LOCAL_DB_PATH)
        except FileNotFoundError:
            print("Remote DB not found! Creating new one via push...")
            # If not found, we just push to a new local file and upload it
            if os.path.exists(LOCAL_DB_PATH):
                os.remove(LOCAL_DB_PATH)

        # 2. Run db push locally
        print("--> Running 'prisma db push' locally...")
        # Ensure schema uses file:./dev.db
        if not run_local_command("npx prisma db push --accept-data-loss"):
            print("Prisma DB Push Failed!")
            return

        # 3. Upload DB back
        print(f"--> Uploading updated {LOCAL_DB_PATH} to {REMOTE_DB_PATH}...")
        sftp.put(LOCAL_DB_PATH, REMOTE_DB_PATH)
        sftp.close()
        
        # 4. Restart Container
        print("--> Restarting remote container...")
        stdin, stdout, stderr = ssh.exec_command("docker restart app-sportsante")
        print(stdout.read().decode())
        
        print("=== Fix Complete ===")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    fix_db_schema()
