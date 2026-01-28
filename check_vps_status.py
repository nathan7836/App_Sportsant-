import paramiko
import sys
import time

VPS_IP = "82.165.195.155"
VPS_USER = "root"
VPS_PASSWORD = "Tl7Z7Wfa"

def check_status():
    print(f"Attempting to connect to {VPS_IP} via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=10)
        print("✅ SSH Connection Successful")
        
        # Check Docker
        print("\n--- Docker Status ---")
        stdin, stdout, stderr = client.exec_command("docker ps -a")
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err: print(f"Error checking docker: {err}")
        
        # Check specific container logs if app-sportsante exists
        print("\n--- Recent Logs (Last 20 lines) ---")
        stdin, stdout, stderr = client.exec_command("docker logs app-sportsante --tail 20 2>&1")
        print(stdout.read().decode())

        # Check if port 80 is listening
        print("\n--- Port 80 Check ---")
        # basic check using netstat or ss if available, or fuser
        stdin, stdout, stderr = client.exec_command("netstat -tulpn | grep :80")
        print(stdout.read().decode())
        
        client.close()
        
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_status()
