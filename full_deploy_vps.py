
import paramiko
import os
import tarfile

def wait_for_command(stdin, stdout, stderr):
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    return exit_status, out, err

def full_deploy():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    local_dir = r"c:\Projet Dev entreprise\App-Sportsante"
    remote_dir = "/root/homecare"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connecté.")
        
        # 1. Stop and remove existing app
        print("\n--- ARRÊT DES CONTENEURS EXISTANTS ---")
        stdin, stdout, stderr = client.exec_command(f"cd {remote_dir} && docker compose down -v")
        wait_for_command(stdin, stdout, stderr)
        
        # Global cleanup
        client.exec_command("docker ps -aq --filter name=sportsante --filter name=homecare | xargs -r docker stop | xargs -r docker rm")
        client.exec_command("fuser -k 80/tcp")
        
        # 2. Wipe old directories
        print("\n--- NETTOYAGE DES RÉPERTOIRES ---")
        stdin, stdout, stderr = client.exec_command("rm -rf /root/homecare /root/app-sportsante")
        wait_for_command(stdin, stdout, stderr)
        
        stdin, stdout, stderr = client.exec_command(f"mkdir -p {remote_dir}")
        wait_for_command(stdin, stdout, stderr)
        
        # 3. Package local files
        print("\n--- CRÉATION DE L'ARCHIVE LOCALE ---")
        tar_gz_name = "app_sportsante.tar.gz"
        tar_gz_path = os.path.join(local_dir, tar_gz_name)
        
        excludes = [
            "node_modules", ".git", ".next", "deploy_to_vps.py", 
            "app_sportsante.tar.gz", "file_list.txt", "out", "build",
            "full_deploy_vps.py", "deploy.tar", "deploy.zip", "deploy_fast.tar"
        ]
        
        with tarfile.open(tar_gz_path, "w:gz") as tar:
            for item in os.listdir(local_dir):
                if item not in excludes:
                    item_path = os.path.join(local_dir, item)
                    tar.add(item_path, arcname=item)
        
        # 4. Upload package
        print("\n--- TÉLÉVERSEMENT DE L'ARCHIVE ---")
        sftp = client.open_sftp()
        sftp.put(tar_gz_path, f"{remote_dir}/{tar_gz_name}")
        sftp.close()
        
        # 5. Extract and Rebuild
        print("\n--- EXTRACTION ET RECONSTRUCTION DOCKER ---")
        cmds = [
            f"cd {remote_dir}",
            f"tar -xzf {tar_gz_name}",
            f"rm {tar_gz_name}",
            "docker compose up -d --build"
        ]
        full_cmd = " && ".join(cmds)
        stdin, stdout, stderr = client.exec_command(full_cmd)
        
        # Stream output
        while True:
            line = stdout.readline()
            if not line: break
            print(line.strip())
            
        _, _, err = wait_for_command(stdin, stdout, stderr)
        if err:
            print("\n--- ERREURS ---")
            print(err)
        
        # Cleanup local tar
        # os.remove(tar_gz_path) # Keep it for now if we need to retry
        print("\nDÉPLOIEMENT TERMINÉ.")

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    full_deploy()
