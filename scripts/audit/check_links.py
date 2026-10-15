#!/usr/bin/env python3
"""
Script de auditoria de links para a Plataforma PITS.
Verifica status HTTP e título da página para uma lista de URLs.
Uso:
  python scripts/audit/check_links.py url1 url2 ...
  python scripts/audit/check_links.py --file lista_urls.txt
  python scripts/audit/check_links.py --json
"""

import sys
import json
import gzip
import re
import urllib.request
import urllib.error
from urllib.parse import urlparse

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def check_url(url, timeout=12):
    url = url.strip()
    if not url:
        return None
    
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        return {
            "url": url,
            "status": "INVALID_URL",
            "title": "URL malformada",
            "redirect_url": None,
            "error": "Esquema ou domínio ausente"
        }

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            final_url = response.geturl()
            status_code = response.getcode()
            content = response.read()

            if response.info().get("Content-Encoding") == "gzip" or content[:2] == b"\x1f\x8b":
                try:
                    content = gzip.decompress(content)
                except Exception:
                    pass

            text = content.decode("utf-8", errors="replace")
            title_match = re.search(r"<title[^>]*>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1).strip() if title_match else "Sem título HTML"
            title = re.sub(r"\s+", " ", title)

            return {
                "url": url,
                "status": status_code,
                "title": title[:120],
                "redirect_url": final_url if final_url != url else None,
                "error": None
            }
    except urllib.error.HTTPError as e:
        return {
            "url": url,
            "status": e.code,
            "title": f"HTTP {e.code}: {e.reason}",
            "redirect_url": None,
            "error": str(e)
        }
    except urllib.error.URLError as e:
        return {
            "url": url,
            "status": "CONNECTION_ERROR",
            "title": "Falha de conexão",
            "redirect_url": None,
            "error": str(e.reason)
        }
    except Exception as e:
        return {
            "url": url,
            "status": "ERROR",
            "title": "Erro desconhecido",
            "redirect_url": None,
            "error": str(e)
        }

def main():
    urls = []
    output_json = False

    args = sys.argv[1:]
    if "--json" in args:
        output_json = True
        args.remove("--json")

    if "--file" in args:
        idx = args.index("--file")
        if idx + 1 < len(args):
            filepath = args[idx + 1]
            with open(filepath, "r", encoding="utf-8") as f:
                urls.extend([line.strip() for line in f if line.strip() and not line.startswith("#")])
            args.pop(idx + 1)
            args.pop(idx)

    for a in args:
        if a.startswith("http://") or a.startswith("https://"):
            urls.append(a)

    if not urls and not sys.stdin.isatty():
        for line in sys.stdin:
            line = line.strip()
            if line and not line.startswith("#"):
                urls.append(line)

    if not urls:
        print("Uso: python scripts/audit/check_links.py <url1> <url2> ... ou via pipe / --file")
        sys.exit(1)

    results = []
    for u in urls:
        res = check_url(u)
        if res:
            results.append(res)

    if output_json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(f"| URL | Status | Título / Motivo | Redirecionamento |")
        print(f"| :--- | :---: | :--- | :--- |")
        for r in results:
            redir = f"[{r['redirect_url']}]({r['redirect_url']})" if r['redirect_url'] else "—"
            err = f" ({r['error']})" if r['error'] else ""
            print(f"| {r['url']} | {r['status']} | {r['title']}{err} | {redir} |")

if __name__ == "__main__":
    main()
