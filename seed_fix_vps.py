
import paramiko
import time

def seed_fix_remote():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    # The robust seed script content (without strict dotenv requirement)
    seed_script_content = """const { PrismaClient } = require('@prisma/client')
try { require('dotenv').config() } catch(e) {}
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@sportsante.com'
    const password = 'admin'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
"""
    
    try:
        client.connect(host, username=username, password=password)
        print("Connecté.")
        
        # 1. Write the new seed file to a temp location on host
        print("Transfert du script seed corrigé...")
        sftp = client.open_sftp()
        with sftp.file("/root/seed_temp.js", "w") as f:
            f.write(seed_script_content)
        sftp.close()
        
        # 2. Copy it into the standalone directory (where node_modules are)
        print("Mise à jour du script dans le conteneur...")
        client.exec_command("docker cp /root/seed_temp.js app-sportsante:/app/.next/standalone/seed.js")
        
        # 3. Run it from there
        print("Lancement du seeding...")
        stdin, stdout, stderr = client.exec_command("docker exec app-sportsante sh -c 'cd /app/.next/standalone && node seed.js'")
        
        while True:
            line = stdout.readline()
            if not line: break
            print(line.strip())
            
        exit_status = stdout.channel.recv_exit_status()
        err = stderr.read().decode()
        
        if exit_status == 0:
            print("\n✅ Base de données initialisée avec succès (Admin créé/mis à jour).")
        else:
            print("\n❌ Erreur lors du seeding :")
            print(err)

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_fix_remote()
