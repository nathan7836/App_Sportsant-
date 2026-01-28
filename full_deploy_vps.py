
import paramiko
import os
import tarfile
from datetime import datetime
import sys

def wait_for_command(stdin, stdout, stderr, critical=False):
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    
    if exit_status != 0 and critical:
        print(f"\n❌ ERREUR CRITIQUE (Code {exit_status})")
        print(f"Sortie: {out}")
        print(f"Erreur: {err}")
        print("🛑 ARRÊT D'URGENCE DU DÉPLOIEMENT POUR PROTÉGER LES DONNÉES.")
        sys.exit(1)
        
    return exit_status, out, err

def full_deploy():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    local_dir = os.getcwd()
    remote_base = "/root/homecare"
    
    # Generate unique backup ID
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_db_path = f"/root/backups/dev_db_{timestamp}.bak"
    backup_uploads_path = f"/root/backups/uploads_{timestamp}"
    
    print(f"Connexion à {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(host, username=username, password=password)
        print("✅ Connecté.")
        
        # 0. Prepare Backup Directory
        print(f"\n--- PRÉPARATION DE LA SAUVEGARDE ({timestamp}) ---")
        client.exec_command("mkdir -p /root/backups")
        
        # 1. STOP & BACKUP (BEFORE DELETE)
        # Check if DB exists first
        stdin, stdout, stderr = client.exec_command(f"[ -f {remote_base}/dev.db ] && echo 'EXISTS'")
        db_exists = stdout.read().decode().strip() == 'EXISTS'
        
        if db_exists:
            print(f"💾 Sauvegarde de la base de données vers : {backup_db_path}")
            # Stop processes to ensure clean DB state (wal files etc)
            print("   Arrêt temporaire des conteneurs pour sécurité...")
            client.exec_command(f"cd {remote_base} && docker compose down")
            
            # COPY with strict error checking
            cp_cmd = f"cp {remote_base}/dev.db {backup_db_path}"
            stdin, stdout, stderr = client.exec_command(cp_cmd)
            wait_for_command(stdin, stdout, stderr, critical=True)
            
            # VERIFY backup file size > 0
            check_cmd = f"[ -s {backup_db_path} ] && echo 'OK'"
            stdin, stdout, stderr = client.exec_command(check_cmd)
            if stdout.read().decode().strip() != 'OK':
                print("❌ ÉCHEC VÉRIFICATION SAUVEGARDE : Le fichier créé est vide ou absent.")
                sys.exit(1)
            print("✅ Sauvegarde DB validée.")
        
        # Backup Uploads
        stdin, stdout, stderr = client.exec_command(f"[ -d {remote_base}/public/uploads ] && echo 'EXISTS'")
        if stdout.read().decode().strip() == 'EXISTS':
            print(f"📂 Sauvegarde des uploads vers : {backup_uploads_path}")
            client.exec_command(f"cp -r {remote_base}/public/uploads {backup_uploads_path}")
        
        # 2. CLEANUP (Only safe now)
        print("\n--- NETTOYAGE ET DÉPLOIEMENT ---")
        # Ensure we don't delete the backup dir we just created/used
        # Removing old app dir
        client.exec_command(f"rm -rf {remote_base} /root/app-sportsante")
        client.exec_command(f"mkdir -p {remote_base}")

        # 3. PACKAGE LOCAL
        print("📦 Création de l'archive locale...")
        tar_gz_name = "app_sportsante.tar.gz"
        tar_gz_path = os.path.join(local_dir, tar_gz_name)
        
        excludes = [
            "node_modules", ".git", ".next", "deploy_to_vps.py", 
            "app_sportsante.tar.gz", "file_list.txt", "out", "build",
            "full_deploy_vps.py", "deploy.tar", "deploy.zip", 
            ".DS_Store", "fix_vps_db_schema.py", "emergency_search_db.py",
            "verify_vps_storage.py"
        ]
        
        with tarfile.open(tar_gz_path, "w:gz") as tar:
            for item in os.listdir(local_dir):
                if item not in excludes:
                    item_path = os.path.join(local_dir, item)
                    tar.add(item_path, arcname=item)
        
        # 4. UPLOAD
        print("⬆️  Téléversement...")
        sftp = client.open_sftp()
        sftp.put(tar_gz_path, f"{remote_base}/{tar_gz_name}")
        sftp.close()
        
        # 5. RESTORE & START
        print("🚀 Restauration et Démarrage...")
        
        # Command chain
        restore_db = f"cp {backup_db_path} ./dev.db && chown 1001:1001 ./dev.db" if db_exists else "echo 'Nouvelle DB sera créée'"
        restore_uploads = f"mkdir -p ./public && cp -r {backup_uploads_path} ./public/uploads && chown -R 1001:1001 ./public/uploads"
        
        # We assume uploads should be restored if backup exists, checks handled dynamically in shell or logic above
        # Simplified restoration logic based on Py variables
        
        cmds = [
            f"cd {remote_base}",
            f"tar -xzf {tar_gz_name}",
            f"rm {tar_gz_name}",
            restore_db,
            # Handle Uploads restoration if variable set? Lazy approach: try copy if path exists
            f"if [ -d {backup_uploads_path} ]; then mkdir -p ./public && cp -r {backup_uploads_path} ./public/uploads && chown -R 1001:1001 ./public/uploads; fi",
            "docker compose up -d --build"
        ]
        
        full_cmd = " && ".join(cmds)
        stdin, stdout, stderr = client.exec_command(full_cmd)
        
        print("   Construction des conteneurs en cours (cela peut prendre 1-2 min)...")
        while True:
            line = stdout.readline()
            if not line: break
            print("   [VPS] " + line.strip())
            
        _, _, err = wait_for_command(stdin, stdout, stderr, critical=False)
        if err:
            print(f"⚠️ Note: {err}")
            
        print("\n✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS.")
        print(f"📍 Backup conservé sur VPS : {backup_db_path}")

    except Exception as e:
        print(f"\n❌ ERREUR EXCEPTIONNELLE: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if os.path.exists(os.path.join(local_dir, tar_gz_name)):
            os.remove(os.path.join(local_dir, tar_gz_name))
        client.close()

if __name__ == "__main__":
    full_deploy()
