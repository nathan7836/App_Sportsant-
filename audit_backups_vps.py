
import paramiko

def audit_backups():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        # We use the previous list (simulated by re-finding) and ls -l
        cmd = "find /var/lib/docker -name 'dev.db' -exec ls -la {} \\;"
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    audit_backups()
