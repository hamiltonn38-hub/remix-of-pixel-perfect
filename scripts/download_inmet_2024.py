import time
import os
import requests

url = "https://portal.inmet.gov.br/uploads/dadoshistoricos/2024.zip"
out_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "inmet_dadoshistoricos_2024.zip")

print("Downloading 2024.zip from INMET BDMEP...")
t0 = time.time()
r = requests.get(url, stream=True, headers={"User-Agent": "Mozilla/5.0"}, timeout=120)
print(f"Status: {r.status_code}, Length: {r.headers.get('content-length')} bytes")

downloaded = 0
with open(out_path, "wb") as f:
    for chunk in r.iter_content(chunk_size=1024*1024):
        if chunk:
            f.write(chunk)
            downloaded += len(chunk)
            mb = downloaded / (1024*1024)
            print(f"Downloaded {mb:.1f} MB...", flush=True)

print(f"Complete: {downloaded} bytes in {time.time()-t0:.1f}s")
