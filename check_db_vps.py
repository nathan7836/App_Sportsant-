
import paramiko
import sys

def check_db_status():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        cmds = [
            "ls -la /root/homecare/dev.db",
            "ls -la /tmp/dev.db.backup",
            "docker exec app-sportsante ls -la /app/dev.db" 
        ]

        for cmd in cmds:
            print(f"\n--- Checking: {cmd} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            if out: print(out)
            if err: print(f"Error: {err}")
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    check_db_status()
