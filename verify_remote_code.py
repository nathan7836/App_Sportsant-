import paramiko

VPS_IP = "82.165.195.155"
VPS_USER = "root"
VPS_PASSWORD = "Tl7Z7Wfa"

def verify_files():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD)
        
        # Check page.tsx (Note: source files might be in /root/homecare not /app in the volume, 
        # but the container builds from /root/homecare. 
        # The working dir in deployment script is /root/homecare)
        
        # Verify app/page.tsx
        print("Checking app/page.tsx for 'GoalDialog' usage...")
        stdin, stdout, stderr = ssh.exec_command("grep -C 2 'GoalDialog' /root/homecare/app/page.tsx")
        print(stdout.read().decode())
        
        # Verify actions/settings-actions.ts
        print("Checking actions/settings-actions.ts for 'ADMIN' role check...")
        stdin, stdout, stderr = ssh.exec_command("grep -C 2 'role' /root/homecare/actions/settings-actions.ts")
        print(stdout.read().decode())
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    verify_files()
