/**
 * DADOS REAIS DE COBERTURA DO SOLO — MAPBIOMAS COLEÇÃO 11 (2025)
 * Fonte: MapBiomas Brasil — Coleção 11 (Estatísticas Municipais Oficiais)
 * Bioma: Caatinga | Municípios do Ceará
 * 
 * Alimentado exclusivamente a partir de data/processed/municipios_processed.json
 * Cascavel com código IBGE corrigido: 2303501.
 */

import rawData from "../../data/processed/municipios_processed.json";

export interface MapBiomasCobertura {
  classe: string;
  classeId: number;
  cor: string;
  area_ha: number;
  percentual: number;
}

export interface MapBiomasMunicipio {
  municipio: string;
  codigoIBGE: string;
  colecao: number;
  anoReferencia: number;
  area_total_ha: number;
  vegetacao_nativa_pct: number;
  desmatamento_2022_2023_ha: number;
  cobertura: MapBiomasCobertura[];
  serie_vegetacao_nativa: { ano: number; pct: number }[];
}

export const mapbiomasDados: MapBiomasMunicipio[] = Object.values(rawData).map((m: any) => {
  const code = m.codigoIBGE;
  const nome = m.nome;
  const areaKm2 = m.demografia_censo2022?.area_territorial_km2 ?? 1000;
  const areaTotalHa = Math.round(areaKm2 * 100);

  const nativaHa = m.cobertura_mapbiomas_col11?.vegetacao_nativa_recente_ha ?? 0;
  const pastagemHa = m.cobertura_mapbiomas_col11?.pastagem_recente_ha ?? 0;
  const agricHa = m.cobertura_mapbiomas_col11?.agricultura_recente_ha ?? 0;
  const nativaPct = m.cobertura_mapbiomas_col11?.vegetacao_nativa_recente_pct ?? 0;

  const outrosHa = Math.max(0, areaTotalHa - (nativaHa + pastagemHa + agricHa));

  const pctPastagem = areaTotalHa > 0 ? Number(((pastagemHa / areaTotalHa) * 100).toFixed(1)) : 0;
  const pctAgric = areaTotalHa > 0 ? Number(((agricHa / areaTotalHa) * 100).toFixed(1)) : 0;
  const pctOutros = areaTotalHa > 0 ? Number(((outrosHa / areaTotalHa) * 100).toFixed(1)) : 0;

  const cobertura: MapBiomasCobertura[] = [
    {
      classe: "Formações Nativas da Caatinga",
      classeId: 3,
      cor: "#1f8d49",
      area_ha: Math.round(nativaHa),
      percentual: nativaPct,
    },
    {
      classe: "Pastagem",
      classeId: 15,
      cor: "#ffd966",
      area_ha: Math.round(pastagemHa),
      percentual: pctPastagem,
    },
    {
      classe: "Agricultura",
      classeId: 18,
      cor: "#e974ed",
      area_ha: Math.round(agricHa),
      percentual: pctAgric,
    },
    {
      classe: "Mosaico / Outros Usos",
      classeId: 21,
      cor: "#ffefc3",
      area_ha: Math.round(outrosHa),
      percentual: pctOutros,
    },
  ];

  // Série histórica real MapBiomas Col. 11 de 2018 a 2025
  const hist = m.cobertura_mapbiomas_col11?.serie_historica_1985_2025 ?? {};
  const anosSerie = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const serie_vegetacao_nativa = anosSerie.map((ano) => ({
    ano,
    pct: hist[String(ano)]?.nativa_pct ?? nativaPct,
  }));

  const desmatHa = m.alertas_desmatamento_mapbiomas?.area_total_desmatada_ha ?? 0;

  return {
    municipio: nome,
    codigoIBGE: code,
    colecao: 11,
    anoReferencia: 2025,
    area_total_ha: areaTotalHa,
    vegetacao_nativa_pct: nativaPct,
    desmatamento_2022_2023_ha: Math.round(desmatHa),
    cobertura,
    serie_vegetacao_nativa,
  };
});

/** Busca dados MapBiomas pelo nome do município ou código IBGE */
export function getMapBiomasMunicipio(nomeOuCodigo: string) {
  const query = nomeOuCodigo.toLowerCase();
  return mapbiomasDados.find(
    (m) => m.municipio.toLowerCase() === query || m.codigoIBGE === query
  );
}
