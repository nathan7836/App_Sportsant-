
import paramiko
import time

def seed_remote():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connecté. Lancement du seeding...")
        
        # Execute seed in the running container
        stdin, stdout, stderr = client.exec_command("docker exec app-sportsante node prisma/seed.js")
        
        # Stream output
        while True:
            line = stdout.readline()
            if not line: break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        err = stderr.read().decode()
        
        if exit_status == 0:
            print("\n✅ Base de données initialisée avec succès (Admin créé).")
        else:
            print("\n❌ Erreur lors du seeding :")
            print(err)

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_remote()
