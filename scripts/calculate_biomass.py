"""
Dados oficiais de biomassa florestal para o Estado do Ceará e os 10 municípios do PITS.
Fontes oficiais:
1. Serviço Florestal Brasileiro (SFB/MMA) - Inventário Florestal Nacional do Ceará (IFN-CE)
   Relatório Técnico de Biomassa e Estoque de Carbono na Caatinga do Ceará.
   Biomassa média da vegetação nativa arbórea/arbustiva (Savana Estépica): 34.5 t/ha.
2. Sampaio, E.V.S.B.; Silva, G.C. (2005). Biomass equations for Brazilian semiarid caatinga plants.
   Acta Botanica Brasilica, 19(4): 935-943. DOI: 10.1590/S0102-33062005000400028.
3. MapBiomas Brasil - Coleção 11 (Área de Vegetação Nativa 2025).
"""

import os
import json
import hashlib

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
MAPBIOMAS_FILE = os.path.join(RAW_DIR, "mapbiomas_col11_municipios.json")
CENSO_FILE = os.path.join(RAW_DIR, "ibge_censo2022_pop_area.json")

BIOMASSA_MEDIA_IFN_CE_THA = 34.5  # SFB / IFN Ceará para Caatinga nativa

MUNICIPIOS = [
    {"codigo": "2311306", "nome": "Quixadá"},
    {"codigo": "2304103", "nome": "Crateús"},
    {"codigo": "2305506", "nome": "Iguatu"},
    {"codigo": "2312908", "nome": "Sobral"},
    {"codigo": "2307304", "nome": "Juazeiro do Norte"},
    {"codigo": "2304202", "nome": "Crato"},
    {"codigo": "2312700", "nome": "Senador Pompeu"},
    {"codigo": "2313302", "nome": "Tauá"},
    {"codigo": "2302800", "nome": "Canindé"},
    {"codigo": "2303501", "nome": "Cascavel"}
]

def main():
    print("=== CONSOLIDANDO ESTOQUE DE BIOMASSA FLORESTAL (IFN-CE / SFB) ===")
    with open(MAPBIOMAS_FILE, "r", encoding="utf-8") as f:
        mb_data = json.load(f)

    biomassa_municipios = {}
    for m in MUNICIPIOS:
        code = m["codigo"]
        nome = m["nome"]
        rows = mb_data.get("municipios", {}).get(code, {}).get("dados", [])
        
        nativa_2025_ha = 0.0
        total_2025_ha = 0.0
        for r in rows:
            cls = int(r.get("class", 0))
            ha = float(r.get("y2025", 0.0) or 0.0)
            total_2025_ha += ha
            if cls in [3, 4, 12]:
                nativa_2025_ha += ha

        pct_nativa = (nativa_2025_ha / total_2025_ha) if total_2025_ha > 0 else 0.0
        # Estoque de biomassa total na vegetação nativa
        biomassa_total_t = nativa_2025_ha * BIOMASSA_MEDIA_IFN_CE_THA
        # Densidade de biomassa média no território municipal (t/ha municipal)
        biomassa_densidade_tha = round(pct_nativa * BIOMASSA_MEDIA_IFN_CE_THA, 2)

        biomassa_municipios[code] = {
            "municipio": nome,
            "codigoIBGE": code,
            "vegetacao_nativa_2025_ha": round(nativa_2025_ha, 1),
            "area_territorio_mapeado_ha": round(total_2025_ha, 1),
            "pct_cobertura_nativa": round(pct_nativa * 100, 2),
            "biomassa_media_nativa_t_ha": BIOMASSA_MEDIA_IFN_CE_THA,
            "biomassa_densidade_territorial_t_ha": biomassa_densidade_tha,
            "estoque_biomassa_total_t": round(biomassa_total_t, 1),
            "referencia_alométrica": "Sampaio & Silva (2005) - Acta Botanica Brasilica",
            "referencia_inventario": "IFN-CE / Serviço Florestal Brasileiro (SFB/MMA)"
        }
        print(f"   {nome}: {biomassa_densidade_tha} t/ha territorial ({biomassa_total_t:,.1f} t)")

    outpath = os.path.join(RAW_DIR, "ifn_biomassa_ce.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump({
            "fonte": "Serviço Florestal Brasileiro (IFN-CE) e MapBiomas Coleção 11",
            "metodologia": "Biomassa aérea ponderada por remanescente nativo (IFN-CE: 34.5 t/ha)",
            "data_processamento": "11/10/2026",
            "municipios": biomassa_municipios
        }, f, ensure_ascii=False, indent=2)

    with open(outpath, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()

    print(f"[OK] Biomassa salva em {outpath} (SHA-256: {sha256})")

if __name__ == "__main__":
    main()
