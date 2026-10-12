/**
 * MÓDULO ÚNICO DE CÁLCULO — PLATAFORMA PITS
 * Especificação matemática oficial baseada no artigo:
 * 
 * Eq. 1: PEL = A_i · Y_i · PCI · η
 * Eq. 4: IVS = 1 - Σ w_k·X_k = Σ w_k·C_k (IVS alto = mais vulnerável)
 * Eq. 5: IVS* = max(IVS · (1 + δ_seca), ε_floor)
 * Eq. 6: IPSE = PEL / IVS*
 * Eq. 7: IPSE_norm = (IPSE - min) / (max - min) [Min-Max entre municípios]
 * 
 * Indicadores de apoio (IB, IIE, IGL) NÃO compõem o IPSE.
 */

export interface LiteraturaParams {
  /** Produtividade de biomassa Y_i (t·ha⁻¹·ano⁻¹), faixa [8, 15] */
  Y_i: number;
  /** Poder Calorífico Inferior PCI (MJ·kg⁻¹ = GJ·t⁻¹), faixa [15, 18] */
  PCI: number;
  /** Eficiência de conversão energética η (adimensional), faixa [0.20, 0.30] */
  eta: number;
}

export const FAIXA_LITERATURA = {
  Y_i: {
    min: 8,
    max: 15,
    default: 10.0,
    unit: "t·ha⁻¹·ano⁻¹",
    label: "Produtividade de biomassa (Y_i)",
    fonte: "Faixa da literatura do artigo (8–15 t·ha⁻¹·ano⁻¹)",
  },
  PCI: {
    min: 15,
    max: 18,
    default: 16.5,
    unit: "MJ·kg⁻¹",
    label: "Poder calorífico inferior (PCI)",
    fonte: "Faixa da literatura do artigo (15–18 MJ·kg⁻¹ = GJ·t⁻¹)",
  },
  eta: {
    min: 0.20,
    max: 0.30,
    default: 0.25,
    unit: "adimensional",
    label: "Eficiência de conversão termodinâmica (η)",
    fonte: "Faixa da literatura do artigo (0,20–0,30)",
  },
} as const;

export const DEFAULT_LITERATURA_PARAMS: LiteraturaParams = {
  Y_i: FAIXA_LITERATURA.Y_i.default,
  PCI: FAIXA_LITERATURA.PCI.default,
  eta: FAIXA_LITERATURA.eta.default,
};

/** Piso paramétrico do IVS para evitar divisão por zero quando IVS ≈ 0 */
export const IVS_PARAMETRIC_FLOOR = 0.05;

/** Pesos padrão para as carências do IVS (Eq. 4) */
export const DEFAULT_IVS_WEIGHTS = [0.25, 0.25, 0.25, 0.25];

export interface CarenciasIVS {
  /** Proporção de domicílios sem rede geral de água canalizada (0-1) */
  agua: number;
  /** Proporção de domicílios com esgotamento sanitário inadequado (0-1) */
  esgoto: number;
  /** Proporção de domicílios sem coleta direta de lixo (0-1) */
  lixo: number;
  /** Proporção de domicílios sem acesso a energia elétrica (0-1) */
  energia: number;
}

/**
 * Normaliza vetor de pesos para garantir que a soma seja exatamente 1.
 */
export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const eq = 1 / weights.length;
    return weights.map(() => eq);
  }
  return weights.map((w) => w / sum);
}

/**
 * Eq. 1: Potencial Energético Local (PEL)
 * PEL = A_i · Y_i · PCI · η
 * 
 * Unidade resultante: GJ·ano⁻¹ (Gigajoules por ano)
 * Nota: 1 MWh = 3.6 GJ.
 * 
 * @param areaHa Área elegível em hectares (MapBiomas, dado real).
 * @param params Parâmetros configuráveis da faixa da literatura.
 */
export function calcPEL(
  areaHa: number | null | undefined,
  params: Partial<LiteraturaParams> = {}
): number | null {
  if (areaHa === null || areaHa === undefined || isNaN(areaHa) || areaHa < 0) {
    return null;
  }

  const p: LiteraturaParams = {
    Y_i: params.Y_i ?? DEFAULT_LITERATURA_PARAMS.Y_i,
    PCI: params.PCI ?? DEFAULT_LITERATURA_PARAMS.PCI,
    eta: params.eta ?? DEFAULT_LITERATURA_PARAMS.eta,
  };

  // PEL (GJ/ano) = A_i (ha) * Y_i (t/ha/ano) * PCI (GJ/t) * eta
  const pel = areaHa * p.Y_i * p.PCI * p.eta;
  return Number(pel.toFixed(2));
}

/**
 * Eq. 4: Índice de Vulnerabilidade Social (IVS)
 * IVS = 1 - Σ w_k·X_k = Σ w_k·C_k
 * 
 * Onde:
 * C_k = (1 - X_k) representam as taxas de carência domiciliar (água, esgoto, lixo, energia).
 * Escala: 0 a 1.
 * DIREÇÃO: IVS alto = MAIS vulnerável (pior situação socioeconômica).
 */
export function calcIVS(
  carencias: CarenciasIVS | null | undefined,
  weights: number[] = DEFAULT_IVS_WEIGHTS
): number | null {
  if (!carencias) return null;

  const { agua, esgoto, lixo, energia } = carencias;
  if (
    agua === undefined || agua === null || isNaN(agua) ||
    esgoto === undefined || esgoto === null || isNaN(esgoto) ||
    lixo === undefined || lixo === null || isNaN(lixo) ||
    energia === undefined || energia === null || isNaN(energia)
  ) {
    return null;
  }

  const w = normalizeWeights(weights);
  const rawIvs = w[0] * agua + w[1] * esgoto + w[2] * lixo + w[3] * energia;
  // Limites no intervalo [0, 1]
  const clamped = Math.max(0, Math.min(1, rawIvs));
  return Number(clamped.toFixed(4));
}

export interface IVSStarOptions {
  /** Fator de penalidade por seca δ_seca ≥ 0 (opcional, padrão 0) */
  droughtPenalty?: number;
  /** Piso paramétrico documentado para evitar divisão por zero (padrão 0.05) */
  floor?: number;
}

/**
 * Eq. 5: IVS* com penalidade de seca opcional e piso paramétrico
 * IVS* = max(IVS · (1 + δ_seca), ε_floor)
 */
export function calcIVSStar(
  ivs: number | null | undefined,
  options: IVSStarOptions = {}
): number | null {
  if (ivs === null || ivs === undefined || isNaN(ivs)) {
    return null;
  }

  const droughtPenalty = Math.max(0, options.droughtPenalty ?? 0);
  const floor = options.floor ?? IVS_PARAMETRIC_FLOOR;

  const penalizado = ivs * (1 + droughtPenalty);
  const finalVal = Math.max(penalizado, floor);
  return Number(finalVal.toFixed(4));
}

/**
 * Eq. 6: Índice de Potencial Socioenergético (IPSE)
 * IPSE = PEL / IVS*
 * 
 * Unidade do IPSE Bruto: GJ·ano⁻¹ (ou MWh·ano⁻¹ se convertido).
 * Representa o potencial energético local disponível por unidade de vulnerabilidade social.
 */
export function calcIPSE(
  pel: number | null | undefined,
  ivsStar: number | null | undefined
): number | null {
  if (
    pel === null || pel === undefined || isNaN(pel) ||
    ivsStar === null || ivsStar === undefined || isNaN(ivsStar) ||
    ivsStar <= 0
  ) {
    return null;
  }

  return Number((pel / ivsStar).toFixed(2));
}

/**
 * Eq. 7: Normalização Min-Max do IPSE entre municípios (0–1)
 * IPSE_norm = (IPSE - min) / (max - min)
 * 
 * Se todos os municípios tiverem o mesmo IPSE (max === min), retorna 1.0.
 * Municípios sem dado ou não calculáveis permanecem como null.
 */
export function normalizeMinMax(
  values: (number | null | undefined)[]
): (number | null)[] {
  const validVals = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (validVals.length === 0) {
    return values.map(() => null);
  }

  const min = Math.min(...validVals);
  const max = Math.max(...validVals);

  return values.map((v) => {
    if (v === null || v === undefined || isNaN(v)) return null;
    if (max === min) return 1.0;
    const norm = (v - min) / (max - min);
    return Number(Math.max(0, Math.min(1, norm)).toFixed(3));
  });
}

/**
 * Classificação textual e semântica do IVS.
 * ATENÇÃO: IVS alto = mais vulnerável (situação crítica).
 */
export function classifyIVS(ivs: number | null | undefined): {
  label: string;
  variant: "success" | "warning" | "destructive" | "muted";
  colorClass: string;
} {
  if (ivs === null || ivs === undefined || isNaN(ivs)) {
    return { label: "Dados indisponíveis", variant: "muted", colorClass: "text-muted-foreground" };
  }
  if (ivs < 0.25) {
    return { label: "Baixa vulnerabilidade", variant: "success", colorClass: "text-success" };
  }
  if (ivs <= 0.45) {
    return { label: "Vulnerabilidade moderada", variant: "warning", colorClass: "text-accent" };
  }
  return { label: "Alta vulnerabilidade", variant: "destructive", colorClass: "text-destructive" };
}

/**
 * Retorna a classe de cor da barra de progresso do IVS.
 * Respeita a direção correta: baixo é verde (bom), alto é vermelho (ruim).
 */
export function getIVSBarColor(ivs: number): string {
  if (ivs < 0.25) return "bg-success";
  if (ivs <= 0.45) return "bg-accent";
  return "bg-destructive";
}

/**
 * Classificação textual do IPSE normalizado (0 a 1).
 */
export function classifyIPSENorm(norm: number | null | undefined): {
  label: string;
  variant: "destructive" | "warning" | "success" | "muted";
} {
  if (norm === null || norm === undefined || isNaN(norm)) {
    return { label: "Não calculável", variant: "muted" };
  }
  if (norm < 0.3) return { label: "Baixo", variant: "destructive" };
  if (norm < 0.6) return { label: "Moderado", variant: "warning" };
  return { label: "Alto", variant: "success" };
}
