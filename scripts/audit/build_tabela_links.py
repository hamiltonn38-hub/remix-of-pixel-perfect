#!/usr/bin/env python3
"""
Gera a tabela completa de auditoria de links (TABELA_LINKS.md e links_verificados.json)
testando todas as URLs institucionais e do MANIFEST concorrentemente com timeout estrito.
"""

import os
import sys
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(__file__))
from check_links import check_url

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    urls = set()

    # 1. MANIFEST.json (URLs reais de endpoints das variáveis)
    manifest_path = os.path.join(root, "data", "MANIFEST.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            for reg in manifest.get("registros", []):
                u = reg.get("url")
                if u and u.startswith("http"):
                    urls.add(u)

    # 2. URLs institucionais e bibliográficas centrais
    institucionais = [
        "https://servicodados.ibge.gov.br/api/v1/localidades/municipios/2311306",
        "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/2311306?formato=application/vnd.geo+json",
        "https://brasil.mapbiomas.org/",
        "https://brasil.mapbiomas.org/downloads/estatisticas/",
        "https://alerta.mapbiomas.org/",
        "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm",
        "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14119.htm",
        "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/decreto/d12044.htm",
        "https://www.gov.br/mma/pt-br/assuntos/bioeconomia",
        "https://floradobrasil.jbrj.gov.br/",
        "https://doi.org/10.1590/S0102-33062005000400028",
        "https://doi.org/10.1590/S1415-43662013000600002",
        "https://portal.inmet.gov.br/",
        "https://www.ipece.ce.gov.br/",
        "https://www.ieabioenergy.com/",
        "https://www.sciencedirect.com/"
    ]
    for u in institucionais:
        urls.add(u)

    url_list = sorted(list(urls))
    print(f"Iniciando verificação de {len(url_list)} URLs com timeout de 5 segundos...")

    results = []
    with ThreadPoolExecutor(max_workers=25) as executor:
        future_to_url = {executor.submit(check_url, u, 5): u for u in url_list}
        for future in as_completed(future_to_url):
            u = future_to_url[future]
            try:
                res = future.result()
                if res:
                    results.append(res)
                else:
                    results.append({"url": u, "status": "ERROR", "title": "Resposta nula"})
            except Exception as e:
                results.append({"url": u, "status": "ERROR", "title": str(e)})

    # Ordenar por status
    results.sort(key=lambda r: (0 if str(r.get("status")) == "200" else 1, str(r.get("status")), r.get("url", "")))

    out_json = os.path.join(root, "docs", "auditoria", "links_verificados.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    out_md = os.path.join(root, "docs", "auditoria", "TABELA_LINKS.md")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("# Verificação de Links e Fontes Oficiais — Plataforma PITS\n\n")
        f.write(f"Data de extração e teste: 13/10/2026 | Total auditado: **{len(results)}** URLs\n\n")
        f.write("| Status HTTP | URL Verificada | Título / Resposta da Fonte |\n")
        f.write("| :---: | :--- | :--- |\n")
        for r in results:
            st = str(r.get("status"))
            badge = f"**{st}**" if st == "200" else f"`{st}`"
            url = r.get("url", "")
            title = r.get("title", "").replace("|", "-")
            f.write(f"| {badge} | [{url}]({url}) | {title} |\n")

    print(f"Sucesso! Gerados:\n- {out_json}\n- {out_md}")

if __name__ == "__main__":
    main()
