"""
Script para download de dados oficiais do IBGE:
- Censo Demográfico 2022: População, Área Territorial, Abastecimento de Água, Esgotamento Sanitário, Coleta de Lixo, Energia Elétrica
- PEVS 2025 (Tabela 289): Quantidade produzida de lenha extraída (m³)
- Censo Agropecuário 2017:
  * Tabela 6881: Sistemas agroflorestais, pastagens, matas, lavouras
  * Tabela 6880: Práticas agrícolas (manejo florestal, rotação, etc.)
  * Tabela 6848: Adubação orgânica e associação a cooperativas/entidades
  * Tabela 6854: Agricultura orgânica
  * Tabela 6879: Orientação técnica
  * Tabela 3346: Energia solar gerada no estabelecimento
Salva dados brutos em data/raw/ibge_*.json
"""

import os
import json
import time
import requests

MUNICIPIOS = {
    "2311306": "Quixadá",
    "2304103": "Crateús",
    "2305506": "Iguatu",
    "2312908": "Sobral",
    "2307304": "Juazeiro do Norte",
    "2304202": "Crato",
    "2312700": "Senador Pompeu",
    "2313302": "Tauá",
    "2302800": "Canindé",
    "2303501": "Cascavel"
}

CODES_STR = ",".join(MUNICIPIOS.keys())
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "PITS-Research-Bot/2.0 (Inteligencia Territorial Socioenergetica; pits@antigravity.ai)"
}

def fetch_sidra(url, name, retries=3):
    print(f"-> Baixando {name}...")
    for attempt in range(1, retries + 1):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                data = r.json()
                filepath = os.path.join(RAW_DIR, f"{name}.json")
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"   [OK] Salvo em {filepath} ({len(data)} registros)")
                return data
            else:
                print(f"   [AVISO] Tentativa {attempt}: HTTP {r.status_code}")
        except Exception as e:
            print(f"   [ERRO] Tentativa {attempt}: {e}")
        time.sleep(2)
    raise RuntimeError(f"Falha ao baixar {name} após {retries} tentativas.")

def main():
    print("=== INICIANDO COLETA DE DADOS DO IBGE ===")
    
    # 1. Censo 2022: População e Área (Tabela 4714)
    # V93 = População residente, V6318 = Área territorial (km²)
    url_censo_pop_area = f"https://apisidra.ibge.gov.br/values/t/4714/p/last%201/v/93,6318/n6/{CODES_STR}"
    fetch_sidra(url_censo_pop_area, "ibge_censo2022_pop_area")

    # 2. PEVS (Tabela 289): Lenha da Extração Vegetal (Variável 144, Categoria 3434)
    url_pevs_lenha = f"https://apisidra.ibge.gov.br/values/t/289/p/last%201/v/144/c193/3434/n6/{CODES_STR}"
    fetch_sidra(url_pevs_lenha, "ibge_pevs_lenha")

    # 3. Censo 2022: Abastecimento de Água (Tabela 6803: V381 Domicílios)
    # C1821/72129 = Total; C1821/72144 = Possui ligação à rede geral e utiliza como principal
    url_censo_agua = f"https://apisidra.ibge.gov.br/values/t/6803/p/last%201/v/381/c1821/72129,72144/n6/{CODES_STR}"
    fetch_sidra(url_censo_agua, "ibge_censo2022_agua")

    # 4. Censo 2022: Esgotamento Sanitário (Tabela 6806: V381 Domicílios)
    # C458/72117 = Total; C11558/46292 = Total, C11558/46290 = Rede geral ou fossa ligada à rede
    url_censo_esgoto = f"https://apisidra.ibge.gov.br/values/t/6806/p/last%201/v/381/c458/72117/c11558/46292,46290/n6/{CODES_STR}"
    fetch_sidra(url_censo_esgoto, "ibge_censo2022_esgoto")

    # 5. Censo 2022: Destino do Lixo (Tabela 6892: V381 Domicílios)
    # C67/10972 = Total; C67/2520 = Coletado por serviço de limpeza
    url_censo_lixo = f"https://apisidra.ibge.gov.br/values/t/6892/p/last%201/v/381/c67/10972,2520/n6/{CODES_STR}"
    fetch_sidra(url_censo_lixo, "ibge_censo2022_lixo")

    # 6. Censo 2022: Tipo de Domicílio e Características Gerais (Tabela 9848: V381 Domicílios)
    # C125/2932 = Total domicílios; C301/72053 = Total água; C1817/72126 = Canalizada até dentro; C11558/46290 = Esgoto rede/fossa
    url_censo_domicilios = f"https://apisidra.ibge.gov.br/values/t/9848/p/last%201/v/381/c125/2932/c301/72053/c1817/72125,72126/c11558/46292/c67/10972/c2661/32776/n6/{CODES_STR}"
    fetch_sidra(url_censo_domicilios, "ibge_censo2022_domicilios_infra")

    # 7. Censo Agro 2017: Utilização das Terras (Tabela 6881)
    # V9587 (Número de estabelecimentos com área) e V184 (Área total dos estabelecimentos em ha)
    # C222: 110087 (Total), 113476 (Sistemas agroflorestais), 113472 (Pastagens naturais),
    # 113469 (Pastagens plantadas boas), 40679 (Matas APP/Reserva Legal), 40680 (Matas naturais),
    # 113470 (Lavouras permanentes), 113471 (Lavouras temporárias)
    url_agro_terras = f"https://apisidra.ibge.gov.br/values/t/6881/p/last%201/v/9587,184/c222/110087,113476,113472,113469,40679,40680,113470,113471/c829/46302/c218/46502/c12517/113601/c12567/41151/n6/{CODES_STR}"
    fetch_sidra(url_agro_terras, "ibge_censoagro2017_utilizacao_terras")

    # 8. Censo Agro 2017: Práticas Agrícolas e Conservação (Tabela 6880)
    # V183 (Estabelecimentos)
    # C12568: 113197 (Total), 41002 (Manejo florestal), 112677 (Rotação de culturas), 112764 (Pousio), 112654 (Plantio em nível)
    url_agro_praticas = f"https://apisidra.ibge.gov.br/values/t/6880/p/last%201/v/183/c12568/113197,41002,112677,112764,112654/c829/46302/c12517/113601/c220/110085/n6/{CODES_STR}"
    fetch_sidra(url_agro_praticas, "ibge_censoagro2017_praticas")

    # 9. Censo Agro 2017: Adubação e Associativismo/Cooperativismo (Tabela 6848)
    # V183 (Estabelecimentos)
    # C12522: 46545 (Total), 46548 (Adubação orgânica)
    # C12598: 41141 (Total), 114543 (É associado), 113455 (Cooperativa)
    url_agro_adubacao_assoc = f"https://apisidra.ibge.gov.br/values/t/6848/p/last%201/v/183/c12522/46545,46548/c12598/41141,114543,113455/c829/46302/c218/46502/c12567/41151/c220/110085/n6/{CODES_STR}"
    fetch_sidra(url_agro_adubacao_assoc, "ibge_censoagro2017_adubacao_assoc")

    # 10. Censo Agro 2017: Agricultura Orgânica (Tabela 6854)
    # V183 (Estabelecimentos)
    # C838: 46559 (Total), 47123 (Sim, agricultura ou pecuária orgânica)
    url_agro_organica = f"https://apisidra.ibge.gov.br/values/t/6854/p/last%201/v/183/c838/46559,47123/c829/46302/c12598/41141/c12567/41151/c220/110085/n6/{CODES_STR}"
    fetch_sidra(url_agro_organica, "ibge_censoagro2017_organica")

    # 11. Censo Agro 2017: Orientação Técnica (Tabela 6879)
    # V183 (Estabelecimentos)
    # C12567: 41151 (Total), 113111 (Recebe orientação técnica)
    url_agro_assistencia = f"https://apisidra.ibge.gov.br/values/t/6879/p/last%201/v/183/c12567/41151,113111/c829/46302/c12517/113601/c12894/46569/n6/{CODES_STR}"
    fetch_sidra(url_agro_assistencia, "ibge_censoagro2017_assistencia")

    # 12. Censo Agro 2017: Fonte de Energia Solar (Tabela 3346)
    # V183 (Estabelecimentos)
    # C12581: 0 (Total), 113135 (Energia solar gerada no estabelecimento)
    url_agro_solar = f"https://apisidra.ibge.gov.br/values/t/3346/p/last%201/v/183/c12581/0,113135/c12566/0/c12548/0/c12567/0/c12552/0/c12517/0/n6/{CODES_STR}"
    fetch_sidra(url_agro_solar, "ibge_censoagro2017_energia_solar")

    print("\n=== TODOS OS DADOS DO IBGE FORAM BAIXADOS COM SUCESSO! ===")

if __name__ == "__main__":
    main()
