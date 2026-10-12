import requests

r = requests.get('https://raw.githubusercontent.com/ThiagoRBM/API_INMET/master/APIBuscaDadosINMET.R')
lines = r.text.splitlines()
for j in range(95, min(len(lines), 125)):
    print(f"{j}: {lines[j].encode('ascii', 'replace').decode('ascii')}")
