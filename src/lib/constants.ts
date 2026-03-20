/**
 * Constantes centralizadas do projeto PITS
 * Evita "números mágicos" espalhados pelo código.
 */

// --- Classificação do IPSE ---
export const IPSE_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
} as const;

export function classifyIPSE(value: number): "baixo" | "moderado" | "alto" {
  if (value < IPSE_THRESHOLDS.low) return "baixo";
  if (value < IPSE_THRESHOLDS.medium) return "moderado";
  return "alto";
}

// --- Severidade de desmatamento (área em hectares) ---
export const DESMAT_SEVERITY = {
  high: 50,
  medium: 10,
} as const;

// --- Cobertura arbórea ---
export const COBERTURA_META_PCT = 40;

// --- Simulador: pesos de impacto das variáveis de intervenção ---
export const SIM_WEIGHTS = {
  agroflorestal: 0.08,
  biodigestores: 0.05,
  acordos: 0.06,
  reflorestamento: 0.07,
  reducaoLenha: 0.04,
} as const;

// --- Gauge colors (HSL vars) ---
export const GAUGE_COLORS = {
  red: "hsl(var(--gauge-red))",
  yellow: "hsl(var(--gauge-yellow))",
  green: "hsl(var(--gauge-green))",
} as const;

export function gaugeColorForIPSE(value: number): string {
  if (value < IPSE_THRESHOLDS.low) return GAUGE_COLORS.red;
  if (value < IPSE_THRESHOLDS.medium) return GAUGE_COLORS.yellow;
  return GAUGE_COLORS.green;
}
