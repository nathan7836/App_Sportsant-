import paramiko

def remote_exec(client, cmd, label=""):
    stdin, stdout, stderr = client.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if label:
        print(f"  [{label}]")
    if out:
        print(f"    {out}")
    if err and exit_status != 0:
        print(f"    ERR: {err}")
    return exit_status, out, err

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect("82.165.195.155", username="root", password="Tl7Z7Wfa")

    print("--- LOGS WEB (depuis demarrage) ---")
    remote_exec(client, "cd /var/www/app-sportsante && docker compose logs --tail=20 web 2>&1", label="Logs")

    print("\n--- TEST HTTP ---")
    remote_exec(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/login", label="/login")
    remote_exec(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", label="/")

    print("\n--- DB ---")
    remote_exec(client, "sqlite3 /var/lib/sportsante/dev.db 'SELECT COUNT(*) FROM Client;'", label="Clients")
    remote_exec(client, "sqlite3 /var/lib/sportsante/dev.db 'SELECT COUNT(*) FROM User;'", label="Users")

    print("\n--- FIND dev.db INSIDE CONTAINER ---")
    remote_exec(client, "docker exec app-sportsante find / -name 'dev.db' 2>/dev/null", label="find dev.db")

    client.close()

if __name__ == "__main__":
    main()
