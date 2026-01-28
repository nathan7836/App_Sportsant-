
import paramiko

def recover_db():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    # Path found in previous step
    source_path = "/var/lib/docker/rootfs/overlayfs/c17476066d22720d9443ab0495ec21c466cc6a1a0bff901ac76cd8c055b2dbb7/app/prisma/dev.db"
    dest_path = "/root/homecare/dev.db"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        print(f"Restoring {source_path} to {dest_path}...")
        
        # Copy and fix permissions (1001 is nextjs user)
        cmds = [
            f"cp {source_path} {dest_path}",
            f"chown 1001:1001 {dest_path}",
            "docker compose -f /root/homecare/docker-compose.yml restart"
        ]
        
        full_cmd = " && ".join(cmds)
        stdin, stdout, stderr = client.exec_command(full_cmd)
        
        print("--- Output ---")
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print("--- Error ---")
            print(err)
        else:
            print("Recovery and restart successful.")
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    recover_db()
