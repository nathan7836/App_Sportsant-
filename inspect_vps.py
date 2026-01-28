
import paramiko
import json

def inspect_container():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        stdin, stdout, stderr = client.exec_command("docker inspect app-sportsante")
        output = stdout.read().decode()
        
        try:
            data = json.loads(output)
            c = data[0]
            
            print("\n--- MOUNTS ---")
            for m in c.get("Mounts", []):
                print(f"{m['Source']} -> {m['Destination']}")
                
            print("\n--- ENV ---")
            for e in c["Config"]["Env"]:
                if "DATABASE_URL" in e:
                    print(e)
                    
            print("\n--- WORKDIR ---")
            print(c["Config"]["WorkingDir"])
            
        except Exception as e:
            print(f"Parse Error: {e}")
            print(output[:500])
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    inspect_container()
