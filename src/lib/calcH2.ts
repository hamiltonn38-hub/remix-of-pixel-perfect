/**
 * MÓDULO DE CÁLCULO DE HIDROGÊNIO (H2) — PLATAFORMA PITS
 * Baseado no modelo termodinâmico e estequiométrico formal (docs/CATALOGO_H2.md)
 * 
 * Rota A: Gaseificação termoquímica de biomassa lenhosa / resíduos lignocelulósicos
 * Rota B: Reforma a vapor de biogás (BSR) de dejetos pecuários
 * 
 * Regra de Ouro: Proibido inventar dados.
 * Todas as equações obedecem à primeira lei da termodinâmica e limites estequiométricos elementares.
 */

export interface ParametrosFaixa {
  min: number;
  tipico: number;
  max: number;
}

export interface RotaAResult {
  pel_h2_mwh_ano: number;
  massa_h2_kg_ano: number;
  demanda_agua_m3_ano: number;
  eficiencia_conversao_pct: number;
}

export interface RotaBResult {
  pel_h2_mwh_ano: number;
  massa_h2_kg_ano: number;
  demanda_agua_m3_ano: number;
  eficiencia_conversao_pct: number;
}

/** Constantes Físico-Químicas Auditadas (NIST Chemistry WebBook / ISO 6976) */
export const CONSTANTES_H2 = {
  /** Poder Calorífico Inferior do Hidrogênio (MJ/kg) */
  PCI_H2: 120.0,
  /** Poder Calorífico Inferior do Metano (MJ/kg) */
  PCI_CH4: 50.0,
  /** Densidade normal do metano a 0 °C, 1 atm (kg/Nm³) */
  DENSIDADE_CH4_NM3: 0.657,
  /** Massa molar do Hidrogênio H2 (g/mol) */
  MASSA_MOLAR_H2: 2.016,
  /** Massa molar do Metano CH4 (g/mol) */
  MASSA_MOLAR_CH4: 16.043,
  /** Massa molar do Carbono C (g/mol) */
  MASSA_MOLAR_C: 12.011,
  /** Massa molar do Hidrogênio atômico H (g/mol) */
  MASSA_MOLAR_H: 1.008,
  /** Massa molar do Oxigênio atômico O (g/mol) */
  MASSA_MOLAR_O: 16.000,
  /** Massa molar da Água H2O (g/mol) */
  MASSA_MOLAR_H2O: 18.015,
  /** Razão estequiométrica mínima de água por hidrogênio (kg H2O / kg H2) = 18.015 / 2.016 */
  RAZAO_H2O_H2: 18.015 / 2.016, // ≈ 8.936
  /** Fator de conversão MJ para MWh (1 MWh = 3600 MJ) */
  MJ_POR_MWH: 3600,
} as const;

/**
 * Calcula o limite estequiométrico máximo teórico da Rota A (kg H2 / kg biomassa seca).
 * Fórmula empírica da biomassa: CH_m O_n
 * Reação com WGS total: CH_m O_n + (2 - n) H2O -> CO2 + (2 - n + m/2) H2
 * 
 * @param C_pct Percentual de Carbono base seca (ex: 47.0)
 * @param H_pct Percentual de Hidrogênio base seca (ex: 5.8)
 * @param O_pct Percentual de Oxigênio base seca (ex: 43.0)
 */
export function limiteEstequiometricoRotaA(C_pct: number, H_pct: number, O_pct: number): number {
  if (C_pct <= 0 || H_pct < 0 || O_pct < 0 || isNaN(C_pct) || isNaN(H_pct) || isNaN(O_pct)) {
    return 0;
  }
  const m = (H_pct / CONSTANTES_H2.MASSA_MOLAR_H) / (C_pct / CONSTANTES_H2.MASSA_MOLAR_C);
  const n = (O_pct / CONSTANTES_H2.MASSA_MOLAR_O) / (C_pct / CONSTANTES_H2.MASSA_MOLAR_C);
  
  const Y_mol = 2 - n + m / 2;
  if (Y_mol <= 0) return 0;

  const M = CONSTANTES_H2.MASSA_MOLAR_C + CONSTANTES_H2.MASSA_MOLAR_H * m + CONSTANTES_H2.MASSA_MOLAR_O * n;
  return (Y_mol * CONSTANTES_H2.MASSA_MOLAR_H2) / M;
}

/**
 * Retorna o limite estequiométrico máximo da Rota B:
 * CH4 + 2 H2O -> CO2 + 4 H2
 * Retorna 4.0 mol H2 / mol CH4 (equivalente a 0.5027 kg H2 / kg CH4).
 */
export function limiteEstequiometricoRotaB(): number {
  return 4.0;
}

/**
 * Calcula o potencial de H2 da Rota A (Gaseificação de biomassa sólida).
 * 
 * @param areaHa Área elegível em hectares (MapBiomas)
 * @param Y_i Produtividade anual de biomassa seca (t·ha⁻¹·ano⁻¹)
 * @param f_i Fração colhível sustentável (ex: 0.20 para corte seletivo em talhões)
 * @param u_i Teor de umidade base úmida (0 se biomassa já estiver em base seca)
 * @param y_H2 Rendimento tecnológico de H2 (kg H2 / kg biomassa seca)
 * @param pci_biomassa Poder calorífico inferior da biomassa seca (MJ/kg)
 */
export function calcRotaA(
  areaHa: number | null | undefined,
  Y_i: number,
  f_i: number,
  u_i: number,
  y_H2: number,
  pci_biomassa: number
): RotaAResult | null {
  if (
    areaHa === null || areaHa === undefined || isNaN(areaHa) || areaHa <= 0 ||
    isNaN(Y_i) || Y_i <= 0 ||
    isNaN(f_i) || f_i <= 0 || f_i > 1 ||
    isNaN(u_i) || u_i < 0 || u_i >= 1 ||
    isNaN(y_H2) || y_H2 <= 0 ||
    isNaN(pci_biomassa) || pci_biomassa <= 0
  ) {
    return null;
  }

  // Massa de biomassa seca disponível (kg/ano)
  const massaBiomassaSeca_kg = areaHa * Y_i * f_i * 1000 * (1 - u_i);

  // Massa de H2 gerada (kg/ano)
  const massa_h2_kg_ano = massaBiomassaSeca_kg * y_H2;

  // Potencial Energético Local em H2 (MWh PCI/ano)
  const pel_h2_mwh_ano = (massa_h2_kg_ano * CONSTANTES_H2.PCI_H2) / CONSTANTES_H2.MJ_POR_MWH;

  // Demanda mínima estequiométrica de água de reação (m³/ano) (1 m³ água ≈ 1000 kg)
  const demanda_agua_m3_ano = (massa_h2_kg_ano * CONSTANTES_H2.RAZAO_H2O_H2) / 1000;

  // Eficiência de conversão térmica (%)
  const eficiencia_conversao_pct = ((y_H2 * CONSTANTES_H2.PCI_H2) / pci_biomassa) * 100;

  return {
    pel_h2_mwh_ano: Number(pel_h2_mwh_ano.toFixed(2)),
    massa_h2_kg_ano: Number(massa_h2_kg_ano.toFixed(1)),
    demanda_agua_m3_ano: Number(demanda_agua_m3_ano.toFixed(2)),
    eficiencia_conversao_pct: Number(eficiencia_conversao_pct.toFixed(2)),
  };
}

/**
 * Calcula o potencial de H2 da Rota B (Reforma a vapor de biogás / metano biogênico).
 * 
 * @param volumeCH4_Nm3 Volume anual de CH4 em Nm³/ano
 * @param rendimento_mol Rendimento da reação de reforma (mol H2 / mol CH4, faixa 2.4 - 2.95)
 * @param perda_psa Fração de perda na purificação PSA (ex: 0.18 para perda de 18% / 82% recuperação)
 */
export function calcRotaB(
  volumeCH4_Nm3: number | null | undefined,
  rendimento_mol: number,
  perda_psa: number
): RotaBResult | null {
  if (
    volumeCH4_Nm3 === null || volumeCH4_Nm3 === undefined || isNaN(volumeCH4_Nm3) || volumeCH4_Nm3 <= 0 ||
    isNaN(rendimento_mol) || rendimento_mol <= 0 || rendimento_mol > limiteEstequiometricoRotaB() ||
    isNaN(perda_psa) || perda_psa < 0 || perda_psa >= 1
  ) {
    return null;
  }

  // Massa de CH4 alimentada (kg/ano)
  const massa_ch4_kg = volumeCH4_Nm3 * CONSTANTES_H2.DENSIDADE_CH4_NM3;

  // Massa de H2 bruta gerada pela reação (kg/ano)
  const massa_h2_bruto = massa_ch4_kg * rendimento_mol * (CONSTANTES_H2.MASSA_MOLAR_H2 / CONSTANTES_H2.MASSA_MOLAR_CH4);

  // Massa de H2 líquida recuperada após purificação PSA (kg/ano)
  const massa_h2_kg_ano = massa_h2_bruto * (1 - perda_psa);

  // Potencial Energético Local em H2 (MWh PCI/ano)
  const pel_h2_mwh_ano = (massa_h2_kg_ano * CONSTANTES_H2.PCI_H2) / CONSTANTES_H2.MJ_POR_MWH;

  // Demanda mínima estequiométrica de água de reação (m³/ano)
  const demanda_agua_m3_ano = (massa_h2_kg_ano * CONSTANTES_H2.RAZAO_H2O_H2) / 1000;

  // Eficiência de conversão térmica (%) = (Energia H2 líquida / Energia CH4 entrada) * 100
  const eficiencia_conversao_pct = ((massa_h2_kg_ano * CONSTANTES_H2.PCI_H2) / (massa_ch4_kg * CONSTANTES_H2.PCI_CH4)) * 100;

  return {
    pel_h2_mwh_ano: Number(pel_h2_mwh_ano.toFixed(2)),
    massa_h2_kg_ano: Number(massa_h2_kg_ano.toFixed(1)),
    demanda_agua_m3_ano: Number(demanda_agua_m3_ano.toFixed(2)),
    eficiencia_conversao_pct: Number(eficiencia_conversao_pct.toFixed(2)),
  };
}
