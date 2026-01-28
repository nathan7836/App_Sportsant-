
import paramiko

def reseed():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    container_name = "app-sportsante"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        print("Executing seed script in container...")
        stdin, stdout, stderr = client.exec_command(f"docker exec {container_name} node prisma/seed.js")
        
        # Stream output
        while True:
            line = stdout.readline()
            if not line: break
            print(line.strip())
            
        _, _, err = stdout.channel.recv_exit_status(), stdout.read().decode(), stderr.read().decode()
        if err:
            print("--- Error ---")
            print(err)
        else:
            print("\nSeed completed successfully.")
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    reseed()
