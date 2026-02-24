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

    print("--- INSIDE CONTAINER: /app/data/ ---")
    remote_exec(client, "docker exec app-sportsante ls -la /app/data/ 2>&1", label="ls /app/data")

    print("\n--- INSIDE CONTAINER: DATABASE_URL ---")
    remote_exec(client, "docker exec app-sportsante printenv DATABASE_URL 2>&1", label="DATABASE_URL")

    print("\n--- INSIDE CONTAINER: find all dev.db ---")
    remote_exec(client, "docker exec app-sportsante find / -name 'dev.db' 2>/dev/null", label="find dev.db")

    print("\n--- INSIDE CONTAINER: prisma schema ---")
    remote_exec(client, "docker exec app-sportsante head -20 /app/prisma/schema.prisma 2>&1", label="Schema")

    print("\n--- INSIDE CONTAINER: file size ---")
    remote_exec(client, "docker exec app-sportsante stat /app/data/dev.db 2>&1", label="stat")

    print("\n--- DOCKER INSPECT MOUNTS ---")
    remote_exec(client, "docker inspect app-sportsante --format '{{json .Mounts}}' 2>&1", label="Mounts")

    client.close()

if __name__ == "__main__":
    main()
