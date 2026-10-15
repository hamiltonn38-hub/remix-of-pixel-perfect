#!/usr/bin/env python3
"""
Script que coleta todas as URLs da plataforma (MANIFEST.json, docs, src)
e executa a checagem HTTP concorrente via ThreadPoolExecutor.
Salva os resultados em JSON e gera a tabela Markdown.
"""

import os
import re
import sys
import json
import glob
from concurrent.futures import ThreadPoolExecutor, as_completed

# Garantir imports locais
sys.path.insert(0, os.path.dirname(__file__))
from check_links import check_url

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    urls = set()

    # 1. MANIFEST.json
    manifest_path = os.path.join(root, "data", "MANIFEST.json")
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            for reg in manifest.get("registros", []):
                u = reg.get("url")
                if u:
                    urls.add(u)

    # 2. docs (ignorar relatorios e auditoria para não criar ciclos)
    doc_files = glob.glob(os.path.join(root, "docs", "**", "*.md"), recursive=True) + glob.glob(os.path.join(root, "docs", "*.md"))
    for fpath in doc_files:
        if "relatorio" in fpath or "auditoria" in fpath:
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                found = re.findall(r"https?://[^\s\)\"\'\>]+", content)
                for u in found:
                    urls.add(u.rstrip(".,;:)]"))
        except Exception:
            pass

    # 3. h2_parametros.csv
    csv_path = os.path.join(root, "data", "literature", "h2_parametros.csv")
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            found = re.findall(r"https?://[^\s\)\"\'\>]+", content)
            for u in found:
                urls.add(u.rstrip(".,;:)]"))

    # 4. src
    src_files = glob.glob(os.path.join(root, "src", "**", "*.*"), recursive=True)
    for fpath in src_files:
        if not fpath.endswith((".ts", ".tsx", ".js", ".jsx", ".json")):
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                found = re.findall(r"https?://[^\s\)\"\'\>]+", content)
                for u in found:
                    urls.add(u.rstrip(".,;:)]"))
        except Exception:
            pass

    filtered_urls = []
    for u in sorted(urls):
        if "localhost" in u or "127.0.0.1" in u or "{" in u or "${" in u or "<" in u:
            continue
        filtered_urls.append(u)

    print(f"Total de URLs identificadas para checagem concorrente: {len(filtered_urls)}")

    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_url = {executor.submit(check_url, u, 7): u for u in filtered_urls}
        for future in as_completed(future_to_url):
            try:
                res = future.result()
                if res:
                    results.append(res)
                    status = res.get("status")
                    print(f"[{status}] {res.get('url')[:65]}")
            except Exception as e:
                u = future_to_url[future]
                results.append({"url": u, "status": "ERROR", "title": "Exceção", "error": str(e)})

    # Ordenar por status e url
    results.sort(key=lambda r: (str(r.get("status")), r.get("url", "")))

    out_json = os.path.join(root, "docs", "auditoria", "links_verificados.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Gerar tabela em Markdown
    out_md = os.path.join(root, "docs", "auditoria", "TABELA_LINKS.md")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write("# Verificação de Links e Fontes Oficiais — PITS\n\n")
        f.write(f"Total de links auditados: **{len(results)}**\n\n")
        f.write("| Status HTTP | URL Verificada | Título / Resposta |\n")
        f.write("| :---: | :--- | :--- |\n")
        for r in results:
            st = str(r.get("status"))
            badge = f"**{st}**" if st == "200" else f"`{st}`"
            url = r.get("url", "")
            title = r.get("title", "").replace("|", "-")
            f.write(f"| {badge} | [{url}]({url}) | {title} |\n")

    print(f"\nFinalizado! Resultados salvos em:\n - {out_json}\n - {out_md}")

if __name__ == "__main__":
    main()
