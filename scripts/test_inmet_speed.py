import time
import requests

url = "https://portal.inmet.gov.br/uploads/dadoshistoricos/2023.zip"
t0 = time.time()
print("Starting GET with stream=True...")
r = requests.get(url, stream=True, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
print(f"Status: {r.status_code}, length: {r.headers.get('content-length')}")
downloaded = 0
for chunk in r.iter_content(chunk_size=1024*1024):
    downloaded += len(chunk)
    elapsed = time.time() - t0
    speed = (downloaded / (1024*1024)) / elapsed
    print(f"Downloaded {downloaded/(1024*1024):.1f} MB ({speed:.2f} MB/s) in {elapsed:.1f}s", end="\r")
    if downloaded >= 10 * 1024 * 1024: # test 10MB
        break
print(f"\nDone test. Speed: {speed:.2f} MB/s")
