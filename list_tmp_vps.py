
import paramiko

def list_tmp():
    host = "82.165.195.155"
    username = "root"
    password = "Tl7Z7Wfa"
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, username=username, password=password)
        
        stdin, stdout, stderr = client.exec_command("ls -la /tmp")
        print(stdout.read().decode())
            
    except Exception as e:
        print(f"SSH Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    list_tmp()
