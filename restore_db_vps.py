
import paramiko
import sys

def restore_db():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    target_db = "/var/www/app-sportsante/prisma/dev.db"
    backup_file = "/root/backups/dev_db_20260129_223119.bak"
    
    print(f"Connecting to {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connected.")
        
        # Verify backup exists
        print(f"Checking for backup: {backup_file}")
        stdin, stdout, stderr = client.exec_command(f"[ -f {backup_file} ] && echo 'FOUND'")
        if stdout.read().decode().strip() != 'FOUND':
            print("❌ Backup file not found!")
            return

        print(f"Found backup. Restoring to {target_db}...")
        
        # Stop container to be safe
        print("Stopping app container...")
        client.exec_command("docker stop app-sportsante")
        
        # Restore
        cmd = f"cp {backup_file} {target_db} && chown 1001:1001 {target_db}"
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("✅ Database restored successfully.")
        else:
            print(f"❌ Restore failed: {stderr.read().decode()}")
            
        # Restart
        print("Restarting app container...")
        client.exec_command("docker start app-sportsante")
        print("✅ App restarted.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    restore_db()
