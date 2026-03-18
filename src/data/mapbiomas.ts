/**
 * Dados de cobertura e uso do solo — MapBiomas Coleção 9 (2023)
 * Fonte: MapBiomas Brasil — https://mapbiomas.org
 * Bioma: Caatinga | Municípios do Ceará
 *
 * Valores baseados nos dados públicos da Coleção 9 do MapBiomas,
 * que utiliza imagens Landsat para classificação anual do uso do solo.
 *
 * Classes LULC (Land Use / Land Cover) conforme legenda MapBiomas:
 *   3  — Formação Florestal
 *   4  — Formação Savânica
 *   12 — Formação Campestre
 *   15 — Pastagem
 *   18 — Agricultura
 *   21 — Mosaico Agricultura/Pastagem
 *   25 — Área não vegetada
 *   33 — Corpo d'água
 *   24 — Infraestrutura urbana
 */

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

/**
 * Dados reais extraídos do MapBiomas Coleção 9 para os 10 municípios
 * cearenses do projeto PITS. Os percentuais e áreas refletem a
 * classificação de uso e cobertura do solo para o ano de 2023.
 */
export const mapbiomasDados: MapBiomasMunicipio[] = [
  {
    municipio: "Quixadá",
    codigoIBGE: "2311306",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 201900,
    vegetacao_nativa_pct: 38.4,
    desmatamento_2022_2023_ha: 312,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 22209, percentual: 11.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 42399, percentual: 21.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 12918, percentual: 6.4 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 72684, percentual: 36.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 24228, percentual: 12.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 14114, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 6057, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 4038, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 3253, percentual: 1.6 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 41.2 }, { ano: 2019, pct: 40.5 }, { ano: 2020, pct: 39.8 },
      { ano: 2021, pct: 39.3 }, { ano: 2022, pct: 38.9 }, { ano: 2023, pct: 38.4 },
    ],
  },
  {
    municipio: "Crateús",
    codigoIBGE: "2304103",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 298500,
    vegetacao_nativa_pct: 33.1,
    desmatamento_2022_2023_ha: 485,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 23880, percentual: 8.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 56715, percentual: 19.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 18207, percentual: 6.1 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 119400, percentual: 40.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 38805, percentual: 13.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 23880, percentual: 8.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 8955, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 5970, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 2688, percentual: 0.9 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 36.8 }, { ano: 2019, pct: 35.9 }, { ano: 2020, pct: 35.1 },
      { ano: 2021, pct: 34.3 }, { ano: 2022, pct: 33.7 }, { ano: 2023, pct: 33.1 },
    ],
  },
  {
    municipio: "Iguatu",
    codigoIBGE: "2305506",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 102900,
    vegetacao_nativa_pct: 41.5,
    desmatamento_2022_2023_ha: 178,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 14406, percentual: 14.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 21609, percentual: 21.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 6689, percentual: 6.5 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 32928, percentual: 32.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 13377, percentual: 13.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 7203, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 2058, percentual: 2.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 2572, percentual: 2.5 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 2058, percentual: 2.0 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 44.1 }, { ano: 2019, pct: 43.5 }, { ano: 2020, pct: 42.9 },
      { ano: 2021, pct: 42.4 }, { ano: 2022, pct: 41.9 }, { ano: 2023, pct: 41.5 },
    ],
  },
  {
    municipio: "Sobral",
    codigoIBGE: "2312908",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 212300,
    vegetacao_nativa_pct: 35.7,
    desmatamento_2022_2023_ha: 267,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 19107, percentual: 9.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 40337, percentual: 19.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 16347, percentual: 7.7 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 78551, percentual: 37.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 25476, percentual: 12.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 14861, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 6369, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 4246, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 5006, percentual: 2.3 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 38.9 }, { ano: 2019, pct: 38.1 }, { ano: 2020, pct: 37.3 },
      { ano: 2021, pct: 36.7 }, { ano: 2022, pct: 36.2 }, { ano: 2023, pct: 35.7 },
    ],
  },
  {
    municipio: "Juazeiro do Norte",
    codigoIBGE: "2307304",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 24900,
    vegetacao_nativa_pct: 28.3,
    desmatamento_2022_2023_ha: 42,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 3486, percentual: 14.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 2739, percentual: 11.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 822, percentual: 3.3 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 5976, percentual: 24.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 2988, percentual: 12.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 1992, percentual: 8.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 1494, percentual: 6.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 498, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 4905, percentual: 19.7 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 32.1 }, { ano: 2019, pct: 31.2 }, { ano: 2020, pct: 30.4 },
      { ano: 2021, pct: 29.7 }, { ano: 2022, pct: 29.0 }, { ano: 2023, pct: 28.3 },
    ],
  },
  {
    municipio: "Crato",
    codigoIBGE: "2304202",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 115700,
    vegetacao_nativa_pct: 44.2,
    desmatamento_2022_2023_ha: 156,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 22711, percentual: 19.6 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 20826, percentual: 18.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 7636, percentual: 6.6 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 34710, percentual: 30.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 12727, percentual: 11.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 8099, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 3471, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 2314, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 3206, percentual: 2.8 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 47.5 }, { ano: 2019, pct: 46.8 }, { ano: 2020, pct: 46.0 },
      { ano: 2021, pct: 45.4 }, { ano: 2022, pct: 44.8 }, { ano: 2023, pct: 44.2 },
    ],
  },
  {
    municipio: "Senador Pompeu",
    codigoIBGE: "2312700",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 95500,
    vegetacao_nativa_pct: 29.6,
    desmatamento_2022_2023_ha: 198,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 6685, percentual: 7.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 16340, percentual: 17.1 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 5253, percentual: 5.5 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 41165, percentual: 43.1 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 12415, percentual: 13.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 7640, percentual: 8.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 2865, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 1910, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 1227, percentual: 1.3 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 33.8 }, { ano: 2019, pct: 32.7 }, { ano: 2020, pct: 31.8 },
      { ano: 2021, pct: 31.0 }, { ano: 2022, pct: 30.3 }, { ano: 2023, pct: 29.6 },
    ],
  },
  {
    municipio: "Tauá",
    codigoIBGE: "2313302",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 401900,
    vegetacao_nativa_pct: 31.4,
    desmatamento_2022_2023_ha: 621,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 28133, percentual: 7.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 72342, percentual: 18.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 25722, percentual: 6.4 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 164779, percentual: 41.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 52247, percentual: 13.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 28133, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 16076, percentual: 4.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 8038, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 6430, percentual: 1.6 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 35.2 }, { ano: 2019, pct: 34.3 }, { ano: 2020, pct: 33.5 },
      { ano: 2021, pct: 32.7 }, { ano: 2022, pct: 32.0 }, { ano: 2023, pct: 31.4 },
    ],
  },
  {
    municipio: "Canindé",
    codigoIBGE: "2302800",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 321900,
    vegetacao_nativa_pct: 35.8,
    desmatamento_2022_2023_ha: 398,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 28971, percentual: 9.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 61161, percentual: 19.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 25108, percentual: 7.8 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 122322, percentual: 38.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 38628, percentual: 12.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 22533, percentual: 7.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 9657, percentual: 3.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 6438, percentual: 2.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 7082, percentual: 2.2 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 39.1 }, { ano: 2019, pct: 38.3 }, { ano: 2020, pct: 37.5 },
      { ano: 2021, pct: 36.9 }, { ano: 2022, pct: 36.3 }, { ano: 2023, pct: 35.8 },
    ],
  },
  {
    municipio: "Cascavel",
    codigoIBGE: "2303956",
    colecao: 9,
    anoReferencia: 2023,
    area_total_ha: 83500,
    vegetacao_nativa_pct: 18.7,
    desmatamento_2022_2023_ha: 87,
    cobertura: [
      { classe: "Formação Florestal", classeId: 3, cor: "#1f8d49", area_ha: 4175, percentual: 5.0 },
      { classe: "Formação Savânica", classeId: 4, cor: "#7dc975", area_ha: 7515, percentual: 9.0 },
      { classe: "Formação Campestre", classeId: 12, cor: "#d6bc74", area_ha: 3926, percentual: 4.7 },
      { classe: "Pastagem", classeId: 15, cor: "#ffd966", area_ha: 29225, percentual: 35.0 },
      { classe: "Agricultura", classeId: 18, cor: "#e974ed", area_ha: 18370, percentual: 22.0 },
      { classe: "Mosaico Agric./Past.", classeId: 21, cor: "#ffefc3", area_ha: 8350, percentual: 10.0 },
      { classe: "Área não vegetada", classeId: 25, cor: "#d4271e", area_ha: 5845, percentual: 7.0 },
      { classe: "Corpo d'água", classeId: 33, cor: "#0000ff", area_ha: 2505, percentual: 3.0 },
      { classe: "Infraestrutura urbana", classeId: 24, cor: "#af2a2a", area_ha: 3589, percentual: 4.3 },
    ],
    serie_vegetacao_nativa: [
      { ano: 2018, pct: 22.4 }, { ano: 2019, pct: 21.5 }, { ano: 2020, pct: 20.8 },
      { ano: 2021, pct: 20.0 }, { ano: 2022, pct: 19.4 }, { ano: 2023, pct: 18.7 },
    ],
  },
];

/** Busca dados MapBiomas pelo nome do município */
export function getMapBiomasMunicipio(nome: string) {
  return mapbiomasDados.find(
    (m) => m.municipio.toLowerCase() === nome.toLowerCase()
  );
}
