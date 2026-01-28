
import paramiko

def reseed_patched():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    container_name = "app-sportsante"

    # Patch: remove dotenv
    js_script = """
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@sportsante.com'
    const password = 'admin' 
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('Seeding database...')

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'ADMIN',
            coachDetails: { create: {} }
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

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        # 1. Write JS file to host /tmp
        print("Uploading patched seed script...")
        sftp = client.open_sftp()
        with sftp.file("/tmp/seed_patched.js", "w") as f:
            f.write(js_script)
        sftp.close()
        
        # 2. Copy to container
        print("Copying to container...")
        stdin, stdout, stderr = client.exec_command(f"docker cp /tmp/seed_patched.js {container_name}:/app/prisma/seed_patched.js")
        
        # 3. Execute
        print("Executing patched seed...")
        stdin, stdout, stderr = client.exec_command(f"docker exec {container_name} node prisma/seed_patched.js")
        
        # Stream output
        print("--- Output ---")
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print("--- Error ---")
            print(err)
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    reseed_patched()
