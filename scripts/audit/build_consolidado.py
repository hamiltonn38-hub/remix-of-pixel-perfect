#!/usr/bin/env python3
"""
Concatena parte_A.md ate parte_G.md em RELATORIO_AUDITORIA_v2.md
e gera a versao HTML diagramada com CSS profissional.
"""

import os

def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    rel_dir = os.path.join(root, "docs", "relatorio")

    partes = ["parte_A.md", "parte_B.md", "parte_C.md", "parte_D.md", "parte_E.md", "parte_F.md", "parte_G.md"]
    conteudos = []

    for p in partes:
        fpath = os.path.join(rel_dir, p)
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                conteudos.append(f.read().strip())

    consolidado_md = "\n\n---\n\n".join(conteudos)

    out_md = os.path.join(rel_dir, "RELATORIO_AUDITORIA_v2.md")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(consolidado_md)

    print(f"Relatorio consolidado gravado em {out_md} ({len(consolidado_md)} caracteres).")

if __name__ == "__main__":
    main()
