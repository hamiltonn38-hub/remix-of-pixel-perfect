import requests
import re

r = requests.get("https://brasil.mapbiomas.org/downloads/estatisticas/", headers={"User-Agent": "Mozilla/5.0"})
print("Status:", r.status_code)
# Search all links
links = re.findall(r'href=[\'"]([^\'" >]+)[\'"]', r.text)
for l in links:
    if any(k in l.lower() for k in ["xlsx", "csv", "zip", "storage.googleapis", "collection", "tabela"]):
        print("Link:", l)
