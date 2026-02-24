
import paramiko
import os
import tarfile
from datetime import datetime
import sys
import time

def wait_for_command(stdin, stdout, stderr, critical=False, label=""):
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()

    if exit_status != 0 and critical:
        print(f"\n   ERREUR CRITIQUE {label} (Code {exit_status})")
        print(f"   Sortie: {out}")
        print(f"   Erreur: {err}")
        print("   ARRET D'URGENCE DU DEPLOIEMENT POUR PROTEGER LES DONNEES.")
        sys.exit(1)

    return exit_status, out, err

def remote_exec(client, cmd, critical=False, label=""):
    """Execute a remote command and return output."""
    stdin, stdout, stderr = client.exec_command(cmd)
    return wait_for_command(stdin, stdout, stderr, critical=critical, label=label)

def full_deploy():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    local_dir = os.getcwd()
    remote_base = "/var/www/app-sportsante"
    db_dir = "/var/lib/sportsante"

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    tar_gz_name = "app_sportsante.tar.gz"
    tar_gz_path = os.path.join(local_dir, tar_gz_name)

    print("=" * 60)
    print("   DEPLOIEMENT SECURISE - SportSante")
    print(f"   {timestamp}")
    print(f"   DB: {db_dir} (JAMAIS TOUCHEE)")
    print("=" * 60)

    print(f"\n[1/7] Connexion a {host}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(host, username=username, password=password)
        print("   OK - Connecte.")

        # ============================================================
        # STEP 2: STOP CONTAINERS FIRST (before touching anything)
        # ============================================================
        print(f"\n[2/7] Arret des conteneurs...")
        remote_exec(client, f"cd {remote_base} && docker compose down 2>/dev/null; echo done")
        time.sleep(3)

        # ============================================================
        # STEP 3: MIGRATE DB TO EXTERNAL DIR + BACKUP
        # ============================================================
        print(f"\n[3/7] Securisation de la DB externe ({db_dir})...")
        remote_exec(client, f"mkdir -p {db_dir}")
        remote_exec(client, "mkdir -p /root/backups")

        # Always check BOTH locations and use the most recent one
        _, old_exists, _ = remote_exec(client, f"[ -f {remote_base}/prisma/dev.db ] && echo 'YES'")
        _, new_exists, _ = remote_exec(client, f"[ -f {db_dir}/dev.db ] && echo 'YES'")

        old_has_db = old_exists.strip() == 'YES'
        new_has_db = new_exists.strip() == 'YES'

        if old_has_db and new_has_db:
            # Both exist: use the NEWER one (the one the app was actually writing to)
            _, old_time, _ = remote_exec(client, f"stat -c %Y {remote_base}/prisma/dev.db 2>/dev/null || echo 0")
            _, new_time, _ = remote_exec(client, f"stat -c %Y {db_dir}/dev.db 2>/dev/null || echo 0")
            old_ts = int(old_time.strip() or '0')
            new_ts = int(new_time.strip() or '0')

            if old_ts > new_ts:
                print(f"   DB dans l'ancien emplacement est PLUS RECENTE. Migration...")
                remote_exec(client, f"cp {remote_base}/prisma/dev.db {db_dir}/dev.db", critical=True, label="MIGRATE NEWER DB")
                remote_exec(client, f"cp {remote_base}/prisma/dev.db-wal {db_dir}/dev.db-wal 2>/dev/null; true")
                remote_exec(client, f"cp {remote_base}/prisma/dev.db-shm {db_dir}/dev.db-shm 2>/dev/null; true")
                print("   OK - DB migree (version la plus recente).")
            else:
                print(f"   DB externe est a jour.")
        elif old_has_db and not new_has_db:
            print(f"   Migration DB vers emplacement externe...")
            remote_exec(client, f"cp {remote_base}/prisma/dev.db {db_dir}/dev.db", critical=True, label="MIGRATE DB")
            remote_exec(client, f"cp {remote_base}/prisma/dev.db-wal {db_dir}/dev.db-wal 2>/dev/null; true")
            remote_exec(client, f"cp {remote_base}/prisma/dev.db-shm {db_dir}/dev.db-shm 2>/dev/null; true")
            print("   OK - DB migree vers emplacement externe.")
        elif new_has_db:
            print(f"   DB externe deja en place.")
        else:
            print("   Aucune DB existante. Premiere installation.")

        # Show DB status
        _, out, _ = remote_exec(client, f"[ -f {db_dir}/dev.db ] && echo 'EXISTS'")
        if out.strip() == 'EXISTS':
            _, db_size, _ = remote_exec(client, f"du -h {db_dir}/dev.db | cut -f1")
            _, db_count, _ = remote_exec(client, f"sqlite3 {db_dir}/dev.db 'SELECT COUNT(*) FROM Client;' 2>/dev/null || echo '?'")
            _, user_count, _ = remote_exec(client, f"sqlite3 {db_dir}/dev.db 'SELECT COUNT(*) FROM User;' 2>/dev/null || echo '?'")
            print(f"   DB: {db_size}, {db_count.strip()} clients, {user_count.strip()} users")

            # Backup de securite
            backup_path = f"/root/backups/dev_db_predeploy_{timestamp}.bak"
            remote_exec(client, f"cp {db_dir}/dev.db {backup_path}")
            print(f"   OK - Backup: {backup_path}")

        # Fix permissions
        remote_exec(client, f"chown -R 1001:1001 {db_dir}")

        # Migrate uploads if needed
        _, old_uploads, _ = remote_exec(client, f"[ -d {remote_base}/public/uploads ] && echo 'YES'")
        if old_uploads.strip() == 'YES':
            remote_exec(client, f"cp -r {remote_base}/public/uploads {db_dir}/uploads 2>/dev/null; true")
        remote_exec(client, f"mkdir -p {db_dir}/uploads")

        # ============================================================
        # STEP 4: CLEAN APP DIRECTORY (DB is safe in /var/lib/sportsante)
        # ============================================================
        print(f"\n[4/7] Nettoyage du code (DB non touchee)...")
        remote_exec(client, f"rm -rf {remote_base}")
        remote_exec(client, f"mkdir -p {remote_base}", critical=True, label="MKDIR")

        # ============================================================
        # STEP 5: CREATE AND UPLOAD ARCHIVE
        # ============================================================
        print(f"\n[5/7] Creation de l'archive locale...")
        excludes = [
            "node_modules", ".git", ".next", "deploy_to_vps.py",
            "app_sportsante.tar.gz", "file_list.txt", "out", "build",
            "full_deploy_vps.py", "deploy.tar", "deploy.zip",
            ".DS_Store", "fix_vps_db_schema.py", "emergency_search_db.py",
            "verify_vps_storage.py", "dev.db", "restore_db_vps.py",
            "verify_r2.py", "fix_vps_now.py", "fix_schema_vps.py",
            "restart_web_vps.py", "verify_and_fix_deploy.py"
        ]

        def tar_filter(tarinfo):
            basename = os.path.basename(tarinfo.name)
            if basename in ('dev.db', 'dev.db-wal', 'dev.db-shm', 'dev.db-journal'):
                return None
            return tarinfo

        with tarfile.open(tar_gz_path, "w:gz") as tar:
            for item in os.listdir(local_dir):
                if item not in excludes:
                    item_path = os.path.join(local_dir, item)
                    tar.add(item_path, arcname=item, filter=tar_filter)

        archive_size = os.path.getsize(tar_gz_path) / (1024 * 1024)
        print(f"   OK - Archive: {archive_size:.1f} Mo (sans dev.db)")

        print(f"\n[6/7] Upload et extraction...")
        sftp = client.open_sftp()
        sftp.put(tar_gz_path, f"{remote_base}/{tar_gz_name}")
        sftp.close()
        remote_exec(client, f"cd {remote_base} && tar -xzf {tar_gz_name} && rm {tar_gz_name}", critical=True, label="EXTRACT")
        print("   OK - Code deploye.")

        # Ensure uploads dir exists
        remote_exec(client, f"mkdir -p {db_dir}/uploads")
        remote_exec(client, f"chown -R 1001:1001 {db_dir}")

        # ============================================================
        # STEP 7: CLEAN LITESTREAM STATE + BUILD AND START WEB ONLY
        # ============================================================
        print(f"\n[7/7] Construction et demarrage...")

        # Clean Litestream state to prevent auto-restore from stale R2 data
        remote_exec(client, f"rm -rf {db_dir}/.dev.db-litestream")
        print("   Litestream state nettoye.")

        # Build and start ONLY web service (NOT backup-worker)
        # Litestream is disabled until R2 bucket is cleaned manually
        stdin, stdout, stderr = client.exec_command(f"cd {remote_base} && docker compose up -d --build web")
        print("   Construction en cours (1-3 min)...")
        while True:
            line = stdout.readline()
            if not line:
                break
            line = line.strip()
            if line:
                print(f"   [VPS] {line}")
        wait_for_command(stdin, stdout, stderr)

        time.sleep(8)

        # VERIFICATION: la DB n'a pas ete touchee
        _, db_check, _ = remote_exec(client, f"sqlite3 {db_dir}/dev.db 'SELECT COUNT(*) FROM Client;' 2>/dev/null || echo 'ERREUR'")
        print(f"\n   VERIFICATION: {db_check.strip()} clients dans la DB")

        # Verify containers
        _, out, _ = remote_exec(client, f"cd {remote_base} && docker compose ps --format '{{{{.Name}}}} {{{{.Status}}}}'")
        print(f"\n   Conteneurs:")
        for line in out.strip().split('\n'):
            if line.strip():
                print(f"     {line.strip()}")

        # Setup cron backup
        backup_script_content = (
            '#!/bin/bash\n'
            'TIMESTAMP=$(date +%Y%m%d_%H%M%S)\n'
            'SRC=/var/lib/sportsante/dev.db\n'
            'DEST=/root/backups/dev_db_auto_${TIMESTAMP}.bak\n'
            'LOG=/root/backups/backup.log\n'
            '\n'
            'if [ -f "$SRC" ]; then\n'
            '    cp "$SRC" "$DEST"\n'
            '    SIZE=$(du -h "$DEST" | cut -f1)\n'
            '    echo "[$TIMESTAMP] OK - Backup: $SIZE -> $DEST" >> $LOG\n'
            '    ls -t /root/backups/dev_db_auto_* 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null\n'
            'else\n'
            '    echo "[$TIMESTAMP] ERREUR - DB introuvable: $SRC" >> $LOG\n'
            'fi\n'
        )

        sftp = client.open_sftp()
        with sftp.open("/root/backup_db.sh", "w") as f:
            f.write(backup_script_content)
        sftp.close()
        remote_exec(client, "chmod +x /root/backup_db.sh")
        remote_exec(client, "crontab -l 2>/dev/null | grep -v backup_db.sh | crontab -")
        remote_exec(client, '(crontab -l 2>/dev/null; echo "0 */6 * * * /root/backup_db.sh") | crontab -')
        remote_exec(client, "/root/backup_db.sh")

        # ============================================================
        # SUMMARY
        # ============================================================
        print("\n" + "=" * 60)
        print("   DEPLOIEMENT TERMINE AVEC SUCCES")
        print("=" * 60)
        print(f"\n   App:      http://82.165.195.155:3000")
        print(f"   DB:       {db_dir}/dev.db (EXTERNE, jamais touchee)")
        print(f"   Uploads:  {db_dir}/uploads (EXTERNE, jamais touches)")
        print(f"\n   PROTECTIONS:")
        print(f"     Litestream  -> DESACTIVE (R2 contient des donnees obsoletes)")
        print(f"     Cron        -> /root/backups/ (toutes les 6h)")
        print(f"     Pre-deploy  -> /root/backups/ (a chaque deploy)")
        print("=" * 60)

    except Exception as e:
        print(f"\n   ERREUR: {e}")
        import traceback
        traceback.print_exc()
        print(f"\n   La DB est intacte dans: {db_dir}/dev.db")
    finally:
        if os.path.exists(tar_gz_path):
            os.remove(tar_gz_path)
        client.close()

if __name__ == "__main__":
    full_deploy()
