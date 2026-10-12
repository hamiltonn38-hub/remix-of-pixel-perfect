import requests
import re

r = requests.get("https://brasil.mapbiomas.org/downloads/estatisticas/", headers={"User-Agent": "Mozilla/5.0"})
# Find all a tags
import re
tags = re.findall(r'<a[^>]+href=[\'"]([^\'"]+)[\'"][^>]*>(.*?)</a>', r.text, re.DOTALL)
for href, text in tags:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in clean_text.lower() for k in ["cobertura", "município", "municipio", "dados", "tabela"]):
        print(f"Text: '{clean_text}' -> Link: {href}")
