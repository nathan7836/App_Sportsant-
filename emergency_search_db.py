
import paramiko

def emergency_search():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("✅ Connecté (Root). Recherche en cours...\n")
        
        # 1. Search for any file named dev.db or ending in .db
        # excluding /proc, /sys, /dev to avoid errors and hang
        find_cmd = "find / -name 'dev.db*' -not -path '/proc/*' -not -path '/sys/*' -not -path '/dev/*' -not -path '/run/*' 2>/dev/null"
        
        print("--- RECHERCHE GLOBALE 'dev.db*' ---")
        stdin, stdout, stderr = client.exec_command(find_cmd)
        files = stdout.read().decode().strip().split('\n')
        
        if not files or files == ['']:
            print("Aucun fichier trouvé.")
        else:
            for f in files:
                if not f: continue
                # Get details for each found file: size, modification time
                cmd = f"ls -l --time-style=long-iso '{f}'"
                stdin2, stdout2, stderr2 = client.exec_command(cmd)
                print(stdout2.read().decode().strip())

        # 2. Check for docker diffs/volumes
        print("\n--- DOCKER VOLUMES/OVERLAY ---")
        # Sometimes deleted files are still held by processes or in overlay diffs (unlikely after rm -rf but worth checking)
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    emergency_search()
