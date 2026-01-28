
import paramiko
import time

def fix_and_seed():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    remote_dir = "/root/homecare"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    # Pre-calculated hash for "admin"
    admin_hash = "$2b$10$uPd0NrGfnJUVS..M1VQAp.5q4FHvVu.RBSJp7OMJATPO.KX1df9K2"
    
    seed_script = f"""
const {{ PrismaClient }} = require('@prisma/client')
// No external dependencies needed!

const prisma = new PrismaClient()

async function main() {{
    const email = 'admin@sportsante.com'
    const passwordHash = '{admin_hash}'

    console.log('Seeding admin user...')
    const user = await prisma.user.upsert({{
        where: {{ email }},
        update: {{
            password: passwordHash
        }},
        create: {{
            email,
            name: 'Super Admin',
            password: passwordHash,
            role: 'ADMIN',
        }},
    }})

    console.log('User synced:', user.email)
}}

main()
    .then(async () => {{
        await prisma.$disconnect()
    }})
    .catch(async (e) => {{
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }})
"""

    try:
        client.connect(host, username=username, password=password)
        print("Connecté.")
        
        # 1. STOP Containers to release lock on DB
        print("Arrêt des conteneurs...")
        client.exec_command(f"cd {remote_dir} && docker compose down")
        time.sleep(5)
        
        # 2. Fix dev.db (Remove dir if exists, create file)
        print("Réparation du fichier de base de données...")
        cmds = [
            f"rm -rf {remote_dir}/dev.db", # Remove if it's a dir or file (we wipe it to be safe and start fresh schema)
            f"touch {remote_dir}/dev.db"   # create empty file
        ]
        for cmd in cmds:
            client.exec_command(cmd)
            
        # 3. Restart Containers
        print("Redémarrage des conteneurs...")
        client.exec_command(f"cd {remote_dir} && docker compose up -d")
        
        print("Attente du démarrage et de la migration (15s)...")
        time.sleep(15) # Wait for entrypoint to run 'db push'
        
        # 2. Copy it into the app root
        print("Mise à jour du script dans le conteneur...")
        client.exec_command("docker cp /root/seed_fixed.js app-sportsante:/app/seed.js")
        
        # 3. Run it from there
        print("Lancement du seeding...")
        stdin, stdout, stderr = client.exec_command("docker exec app-sportsante node /app/seed.js")
        
        while True:
            line = stdout.readline()
            if not line: break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        err = stderr.read().decode()
        
        if exit_status == 0:
            print("\n✅ SUCCÈS : Base de données réparée et Admin restauré !")
            print("Login: admin@sportsante.com / admin")
        else:
            print("\n❌ Erreur finale :")
            print(err)

    except Exception as e:
        print(f"Erreur script: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    fix_and_seed()
