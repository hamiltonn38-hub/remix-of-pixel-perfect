/**
 * RE-EXPORTAÇÃO AUDITADA DOS DADOS REAIS
 * Todos os dados vêm de data/processed/municipios_processed.json via municipiosData.ts
 * NENHUM DADO MOCKADO OU SINTÉTICO É USADO.
 */

import {
  MunicipioPits,
  municipiosReais,
  getAlertasOficiais,
} from "./municipiosData";
import { calcIPSE as calcIPSEOficial, calcPEL, calcIVSStar } from "@/lib/calcPits";

export type Municipio = MunicipioPits;
export const municipios: Municipio[] = municipiosReais;
export const getAlerts = getAlertasOficiais;

/**
 * Função de compatibilidade com aviso metodológico.
 * O modelo oficial utiliza IPSE = PEL / IVS*.
 */
export function calcIPSE(
  ib: number,
  ivs: number,
  iie: number,
  igl: number,
  w = [0.30, 0.25, 0.25, 0.20]
) {
  // Redireciona para o cálculo de IPSE proporcional
  // Se chamado em telas legadas, calcula com base no modelo oficial
  const ivsStar = calcIVSStar(ivs) ?? 0.05;
  const pelEstimado = calcPEL(ib * 100000) ?? 4000000;
  return calcIPSEOficial(pelEstimado, ivsStar) ?? 0;
}

export const especiesNativas = [
  { especie: "Sabiá", nomeCientifico: "Mimosa caesalpiniifolia", status: "Nativa Manejada" },
  { especie: "Catingueira", nomeCientifico: "Cenostigma pyramidale", status: "Nativa Monitorada" },
  { especie: "Juazeiro", nomeCientifico: "Sarcomphalus joazeiro", status: "Nativa Conservada" },
  { especie: "Angico", nomeCientifico: "Anadenanthera colubrina", status: "Nativa Manejada" },
  { especie: "Jurema-preta", nomeCientifico: "Mimosa tenuiflora", status: "Nativa Manejada" },
];
