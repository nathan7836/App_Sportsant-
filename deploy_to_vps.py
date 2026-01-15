
import paramiko

def diagnose():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connecting to {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connected.")
        
        # 1. Docker Status and Mounts
        print("\n--- DOCKER CONTAINERS & MOUNTS ---")
        cmd_docker = "docker ps --format '{{.Names}}' | grep sportsante"
        stdin, stdout, stderr = client.exec_command(cmd_docker)
        containers = stdout.read().decode().strip().split('\n')
        
        for container in containers:
            if container:
                print(f"\nInspecting container: {container}")
                # Get mounts
                cmd_mount = f"docker inspect {container} --format '{{{{json .Mounts}}}}'"
                stdin, stdout, stderr = client.exec_command(cmd_mount)
                print(f"Mounts: {stdout.read().decode().strip()}")
                
                # Try to grep specific UI text inside container
                print(f"Searching for UI text in {container}...")
                cmd_grep = f"docker exec {container} grep -ri 'Assurance RCP' . 2>/dev/null"
                stdin, stdout, stderr = client.exec_command(cmd_grep)
                res = stdout.read().decode().strip()
                if res:
                    print(f"FOUND IN {container}:\n{res}")
                else:
                    print(f"Not found in {container}")

        # 2. Local File search on host (very specific labels from the screenshot)
        labels = ["Gérer le Coach", "Etat du dossier", "Diplômes / Certifications", "Assurance RCP"]
        print("\n--- SEARCHING FOR SPECIFIC LABELS ON VPS HOST ---")
        for label in labels:
            print(f"Searching for '{label}'...")
            cmd = f"grep -ri '{label}' /root /home /var/www --exclude-dir=node_modules 2>/dev/null"
            stdin, stdout, stderr = client.exec_command(cmd)
            res = stdout.read().decode().strip()
            if res:
                print(f"MATCH FOUND: {res}")
            else:
                print(f"No match for '{label}'")

        # Check title in app-sportsante
        p_dir2 = "/root/app-sportsante"
        print(f"\n--- CHECKING TITLE IN {p_dir2} ---")
        cmd_title2 = f"grep -ri 'SportSanté' {p_dir2} --exclude-dir=node_modules 2>/dev/null"
        stdin, stdout, stderr = client.exec_command(cmd_title2)
        print(stdout.read().decode())
        
        # Check if CoachProfile exists in homecare (under any path)
        print(f"\n--- SEARCHING FOR CoachProfile in /root/homecare ---")
        cmd_find3 = "find /root/homecare -name '*CoachProfile*' 2>/dev/null"
        stdin, stdout, stderr = client.exec_command(cmd_find3)
        print(stdout.read().decode())















    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    diagnose()
