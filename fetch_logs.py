import paramiko

VPS_IP = "82.165.195.155"
VPS_USER = "root"
VPS_PASSWORD = "Tl7Z7Wfa"

def fetch_logs():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD)
        print("Fetching logs...")
        stdin, stdout, stderr = ssh.exec_command("docker logs app-sportsante --tail 200")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    fetch_logs()
