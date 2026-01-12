
import paramiko

def diagnose():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    print(f"Connecting to {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("Connected.")
        
        # Search for .git directory to find the actual repo root
        print("Searching for .git directory...")
        cmd = "find /root /var/www /home /opts -type d -name '.git' -prune 2>/dev/null | head -n 1"
        stdin, stdout, stderr = client.exec_command(cmd)
        git_dir = stdout.read().decode().strip()
        print(f"Git directory found: {git_dir}")
        
        project_dir = ""
        if git_dir:
            project_dir = git_dir.replace("/.git", "")
        
        print(f"Determined Directory: {project_dir}")
        
        if project_dir:
            print(f"Project directory: {project_dir}")
            
            # SFTP Upload
            sftp = client.open_sftp()
            
            local_files = [
                r"c:\Projet Dev entreprise\App-Sportsante\components\ui\sheet.tsx",
                r"c:\Projet Dev entreprise\App-Sportsante\components\ui\dialog.tsx",
                r"c:\Projet Dev entreprise\App-Sportsante\app\admin\users\create-user-form.tsx"
            ]
            
            for local_path in local_files:
                filename = local_path.split("\\")[-1]
                if "create-user-form.tsx" in filename:
                     remote_path = f"{project_dir}/app/admin/users/{filename}"
                else:
                     remote_path = f"{project_dir}/components/ui/{filename}"
                print(f"Uploading {filename} to {remote_path}...")
                try:
                    sftp.put(local_path, remote_path)
                    print("Upload successful.")
                except Exception as e:
                    print(f"Failed to upload {filename}: {e}")
            
            sftp.close()
            
            # Rebuild
            cmds = [
                f"cd {project_dir}",
                "docker compose down",
                "docker compose up -d --build"
            ]
            full_cmd = " && ".join(cmds)
            print(f"Executing rebuild: {full_cmd}")
            stdin, stdout, stderr = client.exec_command(full_cmd)
            
            # Stream output
            while True:
                line = stdout.readline()
                if not line: break
                print(line.strip())
            
            err = stderr.read().decode()
            if err:
                print("--- STDERR ---")
                print(err)
        else:
            print("Could not locate git repository on VPS to upload to.")

            
    except Exception as e:
        print(e)
    finally:
        client.close()

if __name__ == "__main__":
    diagnose()
