import requests
import re

url = "https://www.ipece.ce.gov.br/cota-parte-do-icms/"
r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
print(f"Status: {r.status_code}")
links = re.findall(r'href=[\'"]([^\'" >]+)[\'"]', r.text)
for l in set(links):
    if any(k in l.lower() for k in ["iqm", "meio-ambiente", "socioambiental", "cota-parte", "decreto", "calculo", "xlsx", "pdf", "csv"]):
        print("Link:", l)
