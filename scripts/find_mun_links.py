import requests, re

r = requests.get("https://brasil.mapbiomas.org/downloads/estatisticas/", headers={"User-Agent": "Mozilla/5.0"})
links = re.findall(r'href=[\'"]([^\'" >]+)[\'"]', r.text)
for l in links:
    if any(k in l.lower() for k in ["google", "storage", "drive", "zenodo", "municip"]):
        print(l)


