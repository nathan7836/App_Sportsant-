import os
import time
import datetime

SEARCH_ROOTS = ["/var/lib/containerd", "/var/lib/docker", "/tmp", "/root", "/var/www"]
TARGET_DATE = datetime.date.today()

print(f"Searching for 'dev.db' modified on {TARGET_DATE}...")

for root_dir in SEARCH_ROOTS:
    if not os.path.exists(root_dir):
        continue
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for f in filenames:
            if "dev.db" in f:
                full_path = os.path.join(dirpath, f)
                try:
                    mtime = os.path.getmtime(full_path)
                    dt = datetime.datetime.fromtimestamp(mtime)
                    # Check if modified within last 5 days
                    if (datetime.date.today() - dt.date()).days <= 5:
                        print(f"FOUND: {full_path} - {dt}")
                except Exception as e:
                    pass
