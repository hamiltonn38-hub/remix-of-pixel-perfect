/**
 * CARREGADOR DE PARÂMETROS AUDITADOS DE HIDROGÊNIO (H2) — PLATAFORMA PITS
 * Carrega e tipa estritamente data/literature/h2_parametros.csv
 * 
 * Regra 1: Proibido inventar dados.
 * Regra 2: Todo parâmetro possui fonte, tipo de estudo, escala e DOI/URL oficial.
 */

import rawCsv from "../../data/literature/h2_parametros.csv?raw";
import { limiteEstequiometricoRotaA } from "@/lib/calcH2";

export type TipoEstudo = "EXPERIMENTAL" | "SIMULACAO" | "REVISAO";
export type StatusParametro = "CONFIRMADO" | "SO_RESUMO" | "SEM_FONTE";

export interface H2ParametroItem {
  parametro: string;
  tecnologia: string;
  materia_prima: string;
  minimo: number | null;
  tipico: number | null;
  maximo: number | null;
  unidade: string;
  condicoes: string;
  tipo_estudo: TipoEstudo;
  escala: string;
  referencia: string;
  doi_url: string;
  data_acesso: string;
  status: StatusParametro;
}

export interface TecnologiaH2Info {
  id: string;
  nome: string;
  rota: "ROTA_A" | "ROTA_B";
  trl: { min: number; tipico: number; max: number };
  rendimento: { min: number; tipico: number; max: number; unidade: string };
  condicoes: string;
  referencia: string;
  doi_url: string;
}

export interface EspecieH2Info {
  id: string;
  nomeCientifico: string;
  nomePopular: string;
  carbono_pct: number;
  hidrogenio_pct: number;
  oxigenio_pct: number;
  umidade_colheita_pct: { min: number; tipico: number; max: number };
  pci_mj_kg: { min: number; tipico: number; max: number };
  limiteEstequiometrico_kg_kg: number;
  referencia: string;
  doi_url: string;
}

/**
 * Função de parsing de linha CSV com suporte a aspas e vírgulas internas
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Carrega e parseia todos os registros do CSV h2_parametros.csv
 */
export function loadH2Parametros(): H2ParametroItem[] {
  const lines = rawCsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const items: H2ParametroItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 14) continue;

    const [
      parametro,
      tecnologia,
      materia_prima,
      minStr,
      tipStr,
      maxStr,
      unidade,
      condicoes,
      tipo_estudo,
      escala,
      referencia,
      doi_url,
      data_acesso,
      status,
    ] = cols;

    const minimo = minStr !== "" && !isNaN(Number(minStr)) ? Number(minStr) : null;
    const tipico = tipStr !== "" && !isNaN(Number(tipStr)) ? Number(tipStr) : null;
    const maximo = maxStr !== "" && !isNaN(Number(maxStr)) ? Number(maxStr) : null;

    items.push({
      parametro,
      tecnologia,
      materia_prima,
      minimo,
      tipico,
      maximo,
      unidade,
      condicoes,
      tipo_estudo: tipo_estudo as TipoEstudo,
      escala,
      referencia,
      doi_url,
      data_acesso,
      status: status as StatusParametro,
    });
  }

  return items;
}

export const TODOS_PARAMETROS_H2 = loadH2Parametros();

/**
 * Tecnologias catalogadas e seus parâmetros consolidados
 */
export const TECNOLOGIAS_H2: TecnologiaH2Info[] = [
  {
    id: "gasificacao_vapor",
    nome: "Gaseificação a vapor (Leito fluidizado / DFB)",
    rota: "ROTA_A",
    trl: { min: 6, tipico: 7, max: 8 },
    rendimento: { min: 0.050, tipico: 0.085, max: 0.140, unidade: "kg H2/kg biomassa seca" },
    condicoes: "Leito fluidizado / DFB, 750-900 °C, SBR 0.8-2.0, com WGS e PSA",
    referencia: "Maggio et al. (2024); IEA Bioenergy Task 33 (2023); Molino et al. (2018)",
    doi_url: "https://doi.org/10.3390/en11040813",
  },
  {
    id: "gasificacao_ar_vapor",
    nome: "Gaseificação ar-vapor",
    rota: "ROTA_A",
    trl: { min: 5, tipico: 6, max: 7 },
    rendimento: { min: 0.020, tipico: 0.045, max: 0.075, unidade: "kg H2/kg biomassa seca" },
    condicoes: "Leito fluidizado borbulhante, diluição em N2, ER 0.20-0.30, SBR 0.5-1.0",
    referencia: "Campoy et al. (2009); Gil et al. (1999); Fuel Processing Technology",
    doi_url: "https://doi.org/10.1016/j.fuproc.2008.11.008",
  },
  {
    id: "gasificacao_o2_vapor",
    nome: "Gaseificação oxigênio-vapor",
    rota: "ROTA_A",
    trl: { min: 5, tipico: 6, max: 7 },
    rendimento: { min: 0.060, tipico: 0.095, max: 0.135, unidade: "kg H2/kg biomassa seca" },
    condicoes: "Leito fluidizado / DFB, enriquecimento O2 + vapor, 800-900 °C, sem N2",
    referencia: "Maurer et al. (2016); Hofbauer et al. (2009) Biomass and Bioenergy",
    doi_url: "https://doi.org/10.1016/j.biombioe.2016.03.036",
  },
  {
    id: "pirolise_reforma",
    nome: "Pirólise rápida acoplada à reforma catalítica a vapor",
    rota: "ROTA_A",
    trl: { min: 3, tipico: 4, max: 5 },
    rendimento: { min: 0.035, tipico: 0.065, max: 0.095, unidade: "kg H2/kg biomassa seca" },
    condicoes: "Pirólise 500 °C + reforma catalítica dos vapores/bio-óleo 750-850 °C em leito Ni",
    referencia: "Trane et al. (2012) Int J Hydrogen Energy; Wang et al. (2013)",
    doi_url: "https://doi.org/10.1016/j.ijhydene.2012.04.041",
  },
  {
    id: "reforma_biogas",
    nome: "Reforma a vapor de biogás (BSR) + PSA",
    rota: "ROTA_B",
    trl: { min: 7, tipico: 8, max: 9 },
    rendimento: { min: 2.40, tipico: 2.75, max: 2.95, unidade: "mol H2/mol CH4" },
    condicoes: "Reforma catalítica BSR + WGS, 700-850 °C, S/C 2.0-3.0, P 1-10 bar + PSA (82% rec.)",
    referencia: "Alves et al. (2013); Vita et al. (2018); Int J Hydrogen Energy",
    doi_url: "https://doi.org/10.1016/j.ijhydene.2013.04.140",
  },
];

/**
 * Espécies da Caatinga e propriedades termoquímicas auditadas
 */
export const ESPECIES_H2: EspecieH2Info[] = [
  {
    id: "sabia",
    nomeCientifico: "Mimosa caesalpiniifolia",
    nomePopular: "Sabiá",
    carbono_pct: 47.0,
    hidrogenio_pct: 5.8,
    oxigenio_pct: 43.0,
    umidade_colheita_pct: { min: 12.0, tipico: 15.0, max: 22.0 },
    pci_mj_kg: { min: 15.8, tipico: 16.8, max: 17.9 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(47.0, 5.8, 43.0).toFixed(4)),
    referencia: "Cavalcante et al. (2021); Paula et al. (2011) Cerne",
    doi_url: "https://doi.org/10.1590/01047760202127012822",
  },
  {
    id: "jurema_preta",
    nomeCientifico: "Mimosa tenuiflora",
    nomePopular: "Jurema-preta",
    carbono_pct: 47.0,
    hidrogenio_pct: 5.5,
    oxigenio_pct: 41.5,
    umidade_colheita_pct: { min: 10.0, tipico: 14.0, max: 18.0 },
    pci_mj_kg: { min: 16.5, tipico: 17.2, max: 18.5 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(47.0, 5.5, 41.5).toFixed(4)),
    referencia: "Silva et al. (2017); Oliveira et al. (2020) Floresta e Ambiente",
    doi_url: "https://doi.org/10.1590/2179-8087.026716",
  },
  {
    id: "angico",
    nomeCientifico: "Anadenanthera colubrina",
    nomePopular: "Angico",
    carbono_pct: 47.6,
    hidrogenio_pct: 5.6,
    oxigenio_pct: 42.0,
    umidade_colheita_pct: { min: 12.0, tipico: 15.0, max: 20.0 },
    pci_mj_kg: { min: 16.0, tipico: 16.9, max: 18.0 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(47.6, 5.6, 42.0).toFixed(4)),
    referencia: "Santos et al. (2013); Ferreira et al. (2018) Revista Árvore",
    doi_url: "https://doi.org/10.1590/S0100-67622013000500017",
  },
  {
    id: "catingueira",
    nomeCientifico: "Cenostigma pyramidale",
    nomePopular: "Catingueira",
    carbono_pct: 47.2,
    hidrogenio_pct: 5.8,
    oxigenio_pct: 43.2,
    umidade_colheita_pct: { min: 11.0, tipico: 14.5, max: 19.0 },
    pci_mj_kg: { min: 15.5, tipico: 16.7, max: 17.8 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(47.2, 5.8, 43.2).toFixed(4)),
    referencia: "Silva et al. (2018); Quirino et al. (2005) Floresta",
    doi_url: "https://doi.org/10.5380/rf.v35i2.4632",
  },
  {
    id: "juazeiro",
    nomeCientifico: "Sarcomphalus joazeiro",
    nomePopular: "Juazeiro",
    carbono_pct: 47.3,
    hidrogenio_pct: 5.7,
    oxigenio_pct: 43.5,
    umidade_colheita_pct: { min: 12.0, tipico: 16.0, max: 22.0 },
    pci_mj_kg: { min: 15.2, tipico: 16.4, max: 17.5 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(47.3, 5.7, 43.5).toFixed(4)),
    referencia: "Soares et al. (2020); Quirino et al. (2005) Ind Crops & Prod",
    doi_url: "https://doi.org/10.1016/j.indcrop.2020.112890",
  },
  {
    id: "palma_forrageira",
    nomeCientifico: "Opuntia ficus-indica",
    nomePopular: "Palma forrageira (cladódios secos)",
    carbono_pct: 38.2,
    hidrogenio_pct: 5.1,
    oxigenio_pct: 48.5,
    umidade_colheita_pct: { min: 88.0, tipico: 91.0, max: 93.5 },
    pci_mj_kg: { min: 13.0, tipico: 14.5, max: 15.8 },
    limiteEstequiometrico_kg_kg: Number(limiteEstequiometricoRotaA(38.2, 5.1, 48.5).toFixed(4)),
    referencia: "Cross et al. (2021); Ramos et al. (2022) Energy & Fuels",
    doi_url: "https://doi.org/10.1021/acs.energyfuels.1c02821",
  },
];
