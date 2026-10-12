"""
Script para download de alertas de desmatamento da API GraphQL v2 do MapBiomas Alerta.
Utiliza credenciais oficiais do usuário (armazenadas em .env) e códigos de território de municípios.
Salva dados brutos em data/raw/mapbiomas_alertas_municipios.json.
"""

import os
import json
import requests
import hashlib

ROOT_DIR = os.path.join(os.path.dirname(__file__), "..")
RAW_DIR = os.path.join(ROOT_DIR, "data", "raw")
ENV_PATH = os.path.join(ROOT_DIR, ".env")

def load_env():
    vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    vars[k.strip()] = v.strip().strip("'\"")
    return vars

env = load_env()
EMAIL = env.get("MAPBIOMAS_EMAIL", "hamiltonn38@alu.ufc.br")
PASSWORD = env.get("MAPBIOMAS_PASSWORD", "Branquinha1!")
MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"

MUNICIPIOS = [
    {"codigoIBGE": "2311306", "territoryId": 16656, "nome": "Quixadá"},
    {"codigoIBGE": "2304103", "territoryId": 18673, "nome": "Crateús"},
    {"codigoIBGE": "2305506", "territoryId": 15941, "nome": "Iguatu"},
    {"codigoIBGE": "2312908", "territoryId": 17533, "nome": "Sobral"},
    {"codigoIBGE": "2307304", "territoryId": 16029, "nome": "Juazeiro do Norte"},
    {"codigoIBGE": "2304202", "territoryId": 19697, "nome": "Crato"},
    {"codigoIBGE": "2312700", "territoryId": 15538, "nome": "Senador Pompeu"},
    {"codigoIBGE": "2313302", "territoryId": 18661, "nome": "Tauá"},
    {"codigoIBGE": "2302800", "territoryId": 15727, "nome": "Canindé"},
    {"codigoIBGE": "2303501", "territoryId": 17102, "nome": "Cascavel"}
]

def main():
    print("=== BAIXANDO ALERTAS DE DESMATAMENTO (MAPBIOMAS ALERTA V2) ===")
    
    # 1. Login
    login_query = """
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
      }
    }
    """
    print(f"-> Autenticando com {EMAIL}...")
    r = requests.post(
        MAPBIOMAS_API,
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
        json={"query": login_query, "variables": {"email": EMAIL, "password": PASSWORD}},
        timeout=20
    )
    token = r.json()["data"]["signIn"]["token"]
    print("   [OK] Token JWT obtido com sucesso.")

    # 2. Query de Alertas
    alerts_query = """
    query Alerts($territoryIds: [Int!], $limit: Int) {
      alerts(territoryCategory: "city", territoryIds: $territoryIds, limit: $limit) {
        collection {
          alertCode
          areaHa
          detectedAt
          publishedAt
          sources
          coordenates {
            latitude
            longitude
          }
          statusName
        }
      }
    }
    """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    }

    municipios_alertas = {}

    for m in MUNICIPIOS:
        t_id = m["territoryId"]
        nome = m["nome"]
        ibge = m["codigoIBGE"]
        print(f"-> Consultando alertas de {nome} (TerritoryId: {t_id}, IBGE: {ibge})...")
        res = requests.post(
            MAPBIOMAS_API,
            headers=headers,
            json={"query": alerts_query, "variables": {"territoryIds": [t_id], "limit": 100}},
            timeout=25
        )
        res_json = res.json()
        alerts_list = res_json.get("data", {}).get("alerts", {}).get("collection", [])
        total_ha = sum(float(a.get("areaHa", 0.0) or 0.0) for a in alerts_list)
        print(f"   {nome}: {len(alerts_list)} alertas encontrados | Área total: {total_ha:.2f} ha")
        
        municipios_alertas[ibge] = {
            "municipio": nome,
            "codigoIBGE": ibge,
            "territoryId": t_id,
            "total_alertas": len(alerts_list),
            "area_total_desmatada_ha": round(total_ha, 2),
            "alertas": alerts_list
        }

    outpath = os.path.join(RAW_DIR, "mapbiomas_alertas_municipios.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump({
            "fonte": "MapBiomas Alerta API v2",
            "url": MAPBIOMAS_API,
            "data_consulta": "11/10/2026",
            "usuario": EMAIL,
            "municipios": municipios_alertas
        }, f, ensure_ascii=False, indent=2)

    with open(outpath, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()

    print(f"\n[OK] Dados de alertas salvos em {outpath} (SHA-256: {sha256})")

if __name__ == "__main__":
    main()
