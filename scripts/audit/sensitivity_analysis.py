#!/usr/bin/env python3
"""
Script de análise de sensibilidade matemática e dimensional da Plataforma PITS.
"""

import sys
import json

# Forçar stdout para UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    with open("data/processed/municipios_processed.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Amostra Quixadá
    q = data["2311306"]
    area_ha = q["cobertura_mapbiomas_col11"]["vegetacao_nativa_recente_ha"] # 85086
    ind = q["ivs_proprio_censo2022"]["indicadores"]
    carencias = [
        ind["prop_domicilios_sem_rede_agua"],            # 0.1838
        ind["prop_domicilios_esgotamento_inadequado"],   # 0.4229
        ind["prop_domicilios_lixo_nao_coletado"],        # 0.1863
        ind["prop_domicilios_sem_energia_eletrica"]      # 0.0042
    ]

    print("=== ANALISE DE SENSIBILIDADE DO IVS (QUIXADA) ===")
    pesos_base = [0.25, 0.25, 0.25, 0.25]
    ivs_base = sum(w * c for w, c in zip(pesos_base, carencias))
    print(f"IVS Base (pesos iguais 0.25): {ivs_base:.4f}")

    for idx, nome in enumerate(["Agua", "Esgoto", "Lixo", "Energia"]):
        p = [0.50 / 3] * 4
        p[idx] = 0.50
        ivs_cenario = sum(w * c for w, c in zip(p, carencias))
        delta = ivs_cenario - ivs_base
        print(f"  + Peso {nome} (0.50): IVS = {ivs_cenario:.4f} (Delta = {delta:+.4f})")

    print("\n=== ANALISE DE SENSIBILIDADE DO PEL (QUIXADA) ===")
    pel_base = area_ha * 10.0 * 16.5 * 0.25
    print(f"PEL Base (Y=10 t/ha, PCI=16.5 GJ/t, eta=0.25): {pel_base:,.0f} GJ/ano ({pel_base/3.6:,.0f} MWh/ano)")

    pel_min = area_ha * 8.0 * 15.0 * 0.20
    pel_max = area_ha * 15.0 * 18.0 * 0.30
    print(f"  PEL Minimo da Literatura (Y=8, PCI=15, eta=0.20): {pel_min:,.0f} GJ/ano (-{(1 - pel_min/pel_base)*100:.1f}%)")
    print(f"  PEL Maximo da Literatura (Y=15, PCI=18, eta=0.30): {pel_max:,.0f} GJ/ano (+{(pel_max/pel_base - 1)*100:.1f}%)")

    print("\n=== ANALISE DO IPSE E COMPORTAMENTO ASSINTOTICO ===")
    floor = 0.05
    ivs_star_base = max(ivs_base, floor)
    ipse_base = pel_base / ivs_star_base
    print(f"IPSE Base: {ipse_base:,.0f} GJ/ano")

    ivs_star_seca = max(ivs_base * 1.30, floor)
    ipse_seca = pel_base / ivs_star_seca
    print(f"IPSE com Seca (delta_seca = 0.30): {ipse_seca:,.0f} GJ/ano (-{(1 - ipse_seca/ipse_base)*100:.1f}%)")

    for ivs_teste in [0.10, 0.05, 0.02, 0.001, 0.0]:
        ivs_star = max(ivs_teste, floor)
        ipse_teste = pel_base / ivs_star
        print(f"  IVS = {ivs_teste:.3f} -> IVS* = {ivs_star:.3f} -> IPSE = {ipse_teste:,.0f} GJ/ano (Teto assintotico no piso: {pel_base/0.05:,.0f})")

if __name__ == "__main__":
    main()
