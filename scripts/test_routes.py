import requests

test_urls = [
    "https://apitempo.inmet.gov.br/estacao/2023-01-01/2023-01-02/A369",
    "https://apitempo.inmet.gov.br/estacao/2023-01-01/2023-01-02/A325",
    "https://apitempo.inmet.gov.br/estacao/dados/2023-01-01/2023-01-02/A325",
    "https://apitempo.inmet.gov.br/token/estacao/2023-01-01/2023-01-02/A325",
    "https://apitempo.inmet.gov.br/estacoes/T",
    "https://apitempo.inmet.gov.br/clima/precipitacao"
]

for u in test_urls:
    try:
        r = requests.get(u, timeout=5)
        print(f"{r.status_code} ({len(r.content)}b) -> {u}")
    except Exception as e:
        print(f"ERR -> {u}: {e}")
