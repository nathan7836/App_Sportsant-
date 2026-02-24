import boto3
from botocore.config import Config

print("Connecting to Cloudflare R2...")

s3 = boto3.client('s3',
    endpoint_url = 'https://efdfb68130680a1da8989d0b2cb01b2e.r2.cloudflarestorage.com',
    aws_access_key_id = '87c128c0a205d3dff9304a784428e7e6',
    aws_secret_access_key = '54f61c09ad534528345b149ba7507bbc212e0e97b0c9833fceda2e40b4dbec91',
    config = Config(signature_version = 's3v4'),
    region_name = 'auto'
)

print("Listing objects in bucket 'sportsante':")
try:
    response = s3.list_objects_v2(Bucket='sportsante')
    if 'Contents' in response:
        for obj in response['Contents']:
            print(f" - {obj['Key']} ({obj['Size']} bytes) - {obj['LastModified']}")
    else:
        print("Bucket is empty.")
except Exception as e:
    print(f"Error: {e}")
