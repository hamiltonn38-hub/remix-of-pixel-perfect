import requests

urls = [
    "https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_11/statistics/mapbiomas_brazil_col_coverage_biome_state_municipality.xlsx",
    "https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_10/statistics/mapbiomas_brazil_col_coverage_biome_state_municipality.xlsx",
    "https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_9/statistics/mapbiomas_brazil_col_coverage_biome_state_municipality.xlsx",
    "https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_10/statistics/mapbiomas_brazil_col_10_coverage_biome_state_municipality.xlsx",
    "https://storage.googleapis.com/mapbiomas-public/initiatives/brasil/collection_11/statistics/mapbiomas_brazil_col_11_coverage_biome_state_municipality.xlsx",
    "https://brasil.mapbiomas.org/downloads/estatisticas/"
]

for u in urls:
    try:
        r = requests.head(u, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        print(f"HEAD {u} -> Status {r.status_code}, Length: {r.headers.get('Content-Length')}")
    except Exception as e:
        print(f"Error {u}: {e}")
