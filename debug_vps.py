
import paramiko

def debug_remote():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connecté.")
        
        cmds = [
            "ls -F /app",
            "ls -F /app/node_modules | grep bcrypt",
            "ls -F /app/node_modules/.pnpm/bcryptjs* 2>/dev/null"
        ]
        
        for cmd in cmds:
            print(f"\nRunning: {cmd}")
            stdin, stdout, stderr = client.exec_command(f"docker exec app-sportsante {cmd}")
            print(stdout.read().decode())
            print(stderr.read().decode())

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    debug_remote()
