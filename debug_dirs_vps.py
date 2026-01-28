
import paramiko

def debug_dirs():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    container_name = "app-sportsante"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        cmds = [
            f"docker exec {container_name} ls -F /app",
            f"docker exec {container_name} ls -F /app/.next/standalone",
            f"docker exec {container_name} ls -F /app/.next/standalone/node_modules",
            f"docker exec {container_name} ls -F /app/node_modules"
        ]

        for cmd in cmds:
            print(f"\n--- Checking: {cmd} ---")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            if out: print(out)
            if err: print(f"Error: {err}")
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    debug_dirs()
