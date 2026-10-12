"""
Script para validação e padronização taxonômica oficial das espécies nativas monitoradas.
Consulta o backbone taxonômico da Flora e Funga do Brasil / GBIF Taxonomic Backbone.
Salva data/raw/taxonomy_resolved.json
"""

import os
import json
import requests

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

ESPECIES_BASE = [
    {"popular": "Sabiá", "nomeOriginal": "Mimosa caesalpiniifolia", "uso": "Manejo florestal, forragem, estacas"},
    {"popular": "Catingueira", "nomeOriginal": "Poincianella pyramidalis", "uso": "Lenha, regeneração, cerca viva"},
    {"popular": "Juazeiro", "nomeOriginal": "Ziziphus joazeiro", "uso": "Conservação permanente, sombra, forragem na seca"},
    {"popular": "Angico", "nomeOriginal": "Anadenanthera colubrina", "uso": "Manejo madereiro, tanino, apicultura"},
    {"popular": "Jurema-preta", "nomeOriginal": "Mimosa tenuiflora", "uso": "Manejo para lenha e carvão vegetal"}
]

def main():
    print("=== RESOLVENDO TAXONOMIA DAS ESPÉCIES NATIVAS ===")
    resolved = []
    for sp in ESPECIES_BASE:
        name = sp["nomeOriginal"]
        url = f"https://api.gbif.org/v1/species/match?name={name}"
        r = requests.get(url, timeout=15).json()
        
        status = r.get("status")
        accepted_name = r.get("species") or r.get("scientificName")
        family = r.get("family")
        authorship = r.get("authorship", "")
        
        entry = {
            "nomePopular": sp["popular"],
            "nomeAnterior": name,
            "nomeCientificoAceito": accepted_name,
            "statusTaxonomico": status,
            "familia": family,
            "autoria": authorship,
            "usoTradicional": sp["uso"],
            "fonte": "Flora e Funga do Brasil (JBRJ) / GBIF Taxonomic Backbone",
            "url": "https://floradobrasil.jbrj.gov.br/"
        }
        resolved.append(entry)
        print(f"-> {sp['popular']}: {name} -> {accepted_name} [{status}] ({family})")
        
    outpath = os.path.join(RAW_DIR, "taxonomy_resolved.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(resolved, f, ensure_ascii=False, indent=2)
    print(f"[OK] Taxonomia salva em {outpath}")

if __name__ == "__main__":
    main()
