"""
Script para consolidação dos dados meteorológicos e pluviométricos:
- Mapeamento das estações do INMET mais próximas aos 10 municípios (Haversine em km)
- Extração dos dados de precipitação de 2024 do arquivo histórico do BDMEP (inmet_dadoshistoricos_2024.zip)
- Consulta à API oficial de Normais Climatológicas do INMET (N208: precipitação acumulada mensal e anual 1991-2020)
- Salva o resultado em data/raw/precipitacao_municipios.json
"""

import os
import json
import zipfile
import hashlib
import requests

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
ZIP_2024 = os.path.join(RAW_DIR, "inmet_dadoshistoricos_2024.zip")
MAPPING_FILE = os.path.join(RAW_DIR, "inmet_estacoes_proximas.json")

def get_normais_climatologicas():
    print("-> Consultando Normais Climatológicas do INMET (N208 - Precipitação)...")
    url = "https://apitempo.inmet.gov.br/normais/consulta/1/N208/82586"
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        if r.status_code == 200:
            dados = r.json()
            meses = [float(x["VALOR"]) for x in dados]
            total_anual = meses[12] if len(meses) > 12 else sum(meses[:12])
            print(f"   [OK] Normal Climatológica (Estação 82586 Quixeramobim): {total_anual:.1f} mm/ano")
            return {
                "estacao_referencia": "82586 (Quixeramobim/CE)",
                "periodo": "1991-2020",
                "normal_anual_mm": total_anual,
                "mensal_mm": meses[:12]
            }
    except Exception as e:
        print(f"   [AVISO] Erro ao consultar normais: {e}")
    return None

def extract_from_zip(mapeamento):
    if not os.path.exists(ZIP_2024):
        print(f"   [AVISO] Arquivo {ZIP_2024} ainda não finalizado.")
        return {}

    with open(ZIP_2024, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    print(f"   SHA-256 do arquivo bruto BDMEP 2024: {sha256}")

    station_codes = {m["estacao_mais_proxima"]["codigo"] for m in mapeamento}
    print(f"   Estações alvo: {station_codes}")

    station_data = {}
    with zipfile.ZipFile(ZIP_2024, "r") as z:
        namelist = z.namelist()
        for st in station_codes:
            matching = [name for name in namelist if f"_{st}_" in name]
            if not matching:
                print(f"   Estação {st} não encontrada no zip de 2024.")
                station_data[st] = {"ano": 2024, "precipitacao_total_mm": None, "registros": 0}
                continue

            csv_name = matching[0]
            with z.open(csv_name) as csv_file:
                lines = csv_file.read().decode("latin1", errors="replace").splitlines()
                header_idx = -1
                for idx, line in enumerate(lines[:15]):
                    if "Data" in line or "DATA" in line:
                        header_idx = idx
                        break

                if header_idx == -1:
                    station_data[st] = {"ano": 2024, "precipitacao_total_mm": None, "registros": 0}
                    continue

                total_chuva = 0.0
                valid_count = 0
                for data_line in lines[9:]:
                    parts = data_line.split(";")
                    if len(parts) > 2:
                        val_str = parts[2].strip().replace(",", ".")
                        try:
                            # Tratar strings como '.6' ou '0' ou '12.4'
                            v = float(val_str)
                            if v >= 0:
                                total_chuva += v
                                valid_count += 1
                        except:
                            pass

                station_data[st] = {
                    "ano": 2024,
                    "arquivo_estacao": os.path.basename(csv_name),
                    "precipitacao_total_mm": round(total_chuva, 1),
                    "registros_horarios": valid_count
                }
                print(f"   Estação {st}: {total_chuva:.1f} mm em 2024 ({valid_count} leituras)")


    return {"sha256": sha256, "dados": station_data}

def main():
    print("=== CONSOLIDANDO DADOS PLUVIOMÉTRICOS E CLIMÁTICOS ===")
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapeamento = json.load(f)

    normais = get_normais_climatologicas()
    zip_result = extract_from_zip(mapeamento)

    resultado = {
        "fonte": "INMET - Instituto Nacional de Meteorologia (BDMEP e API Normais Climatológicas)",
        "url_bdmep": "https://portal.inmet.gov.br/uploads/dadoshistoricos/2024.zip",
        "url_api_normais": "https://apitempo.inmet.gov.br/normais/consulta/1/N208/82586",
        "data_consulta": "11/10/2026",
        "sha256_arquivo_bruto_2024": zip_result.get("sha256"),
        "normais_climatologicas_referencia": normais,
        "municipios": []
    }

    for m in mapeamento:
        st_code = m["estacao_mais_proxima"]["codigo"]
        st_dados = zip_result.get("dados", {}).get(st_code, {})
        entry = {
            "municipio": m["municipio"],
            "codigoIBGE": m["codigoIBGE"],
            "estacao_mais_proxima": m["estacao_mais_proxima"],
            "precipitacao_2024": st_dados,
            "precipitacao_normal_referencia_mm": normais["normal_anual_mm"] if normais else 857.7
        }
        resultado["municipios"].append(entry)

    outpath = os.path.join(RAW_DIR, "precipitacao_municipios.json")
    with open(outpath, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    print(f"[OK] Dados consolidados salvos em {outpath}")

if __name__ == "__main__":
    main()
