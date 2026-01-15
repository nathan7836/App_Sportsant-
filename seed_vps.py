
import paramiko

def seed_vps():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connecté.")
        
        commands = [
            "docker exec app-sportsante npx prisma migrate deploy",
            "docker exec app-sportsante npx prisma generate",
            "docker exec app-sportsante node prisma/seed.js"
        ]
        
        for cmd in commands:
            print(f"\nExécution: {cmd}")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out: print(f"SORTIE:\n{out}")
            if err: print(f"ERREUR:\n{err}")
            
        print("\nInitialisation terminée.")

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_vps()
