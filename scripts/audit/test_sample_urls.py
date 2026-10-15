import os, sys, json
sys.path.insert(0, 'scripts/audit')
from check_links import check_url

test_urls = [
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios/2311306",
    "https://brasil.mapbiomas.org/",
    "https://doi.org/10.1590/S0102-33062005000400028",
    "https://doi.org/10.1590/S1415-43662013000600002",
    "https://floradobrasil.jbrj.gov.br/",
    "https://www.gov.br/mma/pt-br/assuntos/bioeconomia",
    "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm",
    "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14119.htm",
    "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12044.htm"
]

for u in test_urls:
    res = check_url(u, timeout=5)
    print(res["status"], u[:50], res["title"][:40])
