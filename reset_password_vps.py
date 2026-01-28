
import paramiko
import time

def reset_password():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    container_name = "app-sportsante" # From previous logs

    js_script = """
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sportsante.com';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { 
                password: hashedPassword,
                role: 'ADMIN' 
            },
            create: {
                email,
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
                coachDetails: { create: {} }
            }
        });
        console.log('SUCCESS: User updated:', user.email);
    } catch (e) {
        console.error('ERROR:', e);
        process.exit(1);
    }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
"""

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        print("Connected.")
        
        # 1. Write JS file to host
        print("Uploading script...")
        sftp = client.open_sftp()
        with sftp.file("/tmp/reset_pass.js", "w") as f:
            f.write(js_script)
        sftp.close()
        
        # 2. Copy to container
        print("Copying to container...")
        stdin, stdout, stderr = client.exec_command(f"docker cp /tmp/reset_pass.js {container_name}:/app/reset_pass.js")
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f"Error copying: {stderr.read().decode()}")
            return

        # 3. Execute in container
        print("Executing script...")
        # We assume /app is WORKDIR and node_modules are there
        stdin, stdout, stderr = client.exec_command(f"docker exec {container_name} node /app/reset_pass.js")
        
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
    reset_password()
