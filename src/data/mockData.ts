export interface Municipio {
  municipio: string;
  estado: string;
  area_km2: number;
  populacao: number;
  IPSE: number;
  IB: number;
  IVS: number;
  IIE: number;
  IGL: number;
  cobertura_arborea_pct: number;
  estoque_biomassa_t_ha: number;
  area_sistemas_integrados_pct: number;
  acordos_manejo_ativos: number;
  participacao_comunitaria_pct: number;
  psa_recursos_ano_reais: number;
  biodigestores: number;
  demanda_lenha_sem_manejo_m3_ano: number;
  taxa_regeneracao_pct_ano: number;
  eficiencia_conversao_energetica_pct: number;
}

export const municipios: Municipio[] = [
  {
    municipio: "Quixadá", estado: "CE", area_km2: 2019, populacao: 83245,
    IPSE: 0.54, IB: 0.61, IVS: 0.48, IIE: 0.52, IGL: 0.55,
    cobertura_arborea_pct: 34.2, estoque_biomassa_t_ha: 18.7,
    area_sistemas_integrados_pct: 22.4, acordos_manejo_ativos: 7,
    participacao_comunitaria_pct: 41.0, psa_recursos_ano_reais: 187000,
    biodigestores: 12, demanda_lenha_sem_manejo_m3_ano: 42300,
    taxa_regeneracao_pct_ano: 3.1, eficiencia_conversao_energetica_pct: 38.0,
  },
  {
    municipio: "Crateús", estado: "CE", area_km2: 2985, populacao: 72312,
    IPSE: 0.47, IB: 0.52, IVS: 0.41, IIE: 0.45, IGL: 0.50,
    cobertura_arborea_pct: 28.5, estoque_biomassa_t_ha: 15.2,
    area_sistemas_integrados_pct: 18.1, acordos_manejo_ativos: 5,
    participacao_comunitaria_pct: 35.0, psa_recursos_ano_reais: 142000,
    biodigestores: 8, demanda_lenha_sem_manejo_m3_ano: 38700,
    taxa_regeneracao_pct_ano: 2.8, eficiencia_conversao_energetica_pct: 34.0,
  },
  {
    municipio: "Iguatu", estado: "CE", area_km2: 1029, populacao: 102614,
    IPSE: 0.58, IB: 0.63, IVS: 0.52, IIE: 0.56, IGL: 0.61,
    cobertura_arborea_pct: 36.8, estoque_biomassa_t_ha: 20.1,
    area_sistemas_integrados_pct: 25.7, acordos_manejo_ativos: 9,
    participacao_comunitaria_pct: 45.0, psa_recursos_ano_reais: 215000,
    biodigestores: 15, demanda_lenha_sem_manejo_m3_ano: 35200,
    taxa_regeneracao_pct_ano: 3.4, eficiencia_conversao_energetica_pct: 41.0,
  },
  {
    municipio: "Sobral", estado: "CE", area_km2: 2123, populacao: 210711,
    IPSE: 0.65, IB: 0.68, IVS: 0.60, IIE: 0.64, IGL: 0.67,
    cobertura_arborea_pct: 39.1, estoque_biomassa_t_ha: 22.3,
    area_sistemas_integrados_pct: 31.2, acordos_manejo_ativos: 12,
    participacao_comunitaria_pct: 52.0, psa_recursos_ano_reais: 320000,
    biodigestores: 22, demanda_lenha_sem_manejo_m3_ano: 28100,
    taxa_regeneracao_pct_ano: 3.8, eficiencia_conversao_energetica_pct: 45.0,
  },
  {
    municipio: "Juazeiro do Norte", estado: "CE", area_km2: 249, populacao: 276264,
    IPSE: 0.71, IB: 0.72, IVS: 0.68, IIE: 0.71, IGL: 0.70,
    cobertura_arborea_pct: 41.5, estoque_biomassa_t_ha: 24.0,
    area_sistemas_integrados_pct: 35.0, acordos_manejo_ativos: 14,
    participacao_comunitaria_pct: 58.0, psa_recursos_ano_reais: 410000,
    biodigestores: 28, demanda_lenha_sem_manejo_m3_ano: 21500,
    taxa_regeneracao_pct_ano: 4.1, eficiencia_conversao_energetica_pct: 48.0,
  },
  {
    municipio: "Crato", estado: "CE", area_km2: 1157, populacao: 132123,
    IPSE: 0.62, IB: 0.66, IVS: 0.58, IIE: 0.60, IGL: 0.63,
    cobertura_arborea_pct: 38.0, estoque_biomassa_t_ha: 21.0,
    area_sistemas_integrados_pct: 28.5, acordos_manejo_ativos: 10,
    participacao_comunitaria_pct: 48.0, psa_recursos_ano_reais: 265000,
    biodigestores: 18, demanda_lenha_sem_manejo_m3_ano: 30200,
    taxa_regeneracao_pct_ano: 3.5, eficiencia_conversao_energetica_pct: 42.0,
  },
  {
    municipio: "Senador Pompeu", estado: "CE", area_km2: 955, populacao: 27054,
    IPSE: 0.39, IB: 0.42, IVS: 0.35, IIE: 0.38, IGL: 0.41,
    cobertura_arborea_pct: 25.3, estoque_biomassa_t_ha: 13.5,
    area_sistemas_integrados_pct: 14.2, acordos_manejo_ativos: 3,
    participacao_comunitaria_pct: 28.0, psa_recursos_ano_reais: 85000,
    biodigestores: 4, demanda_lenha_sem_manejo_m3_ano: 48500,
    taxa_regeneracao_pct_ano: 2.2, eficiencia_conversao_energetica_pct: 29.0,
  },
  {
    municipio: "Tauá", estado: "CE", area_km2: 4019, populacao: 58517,
    IPSE: 0.44, IB: 0.49, IVS: 0.39, IIE: 0.43, IGL: 0.46,
    cobertura_arborea_pct: 27.1, estoque_biomassa_t_ha: 14.8,
    area_sistemas_integrados_pct: 16.8, acordos_manejo_ativos: 4,
    participacao_comunitaria_pct: 32.0, psa_recursos_ano_reais: 120000,
    biodigestores: 6, demanda_lenha_sem_manejo_m3_ano: 44100,
    taxa_regeneracao_pct_ano: 2.5, eficiencia_conversao_energetica_pct: 31.0,
  },
  {
    municipio: "Canindé", estado: "CE", area_km2: 3219, populacao: 76012,
    IPSE: 0.50, IB: 0.55, IVS: 0.45, IIE: 0.49, IGL: 0.52,
    cobertura_arborea_pct: 31.4, estoque_biomassa_t_ha: 16.9,
    area_sistemas_integrados_pct: 20.0, acordos_manejo_ativos: 6,
    participacao_comunitaria_pct: 38.0, psa_recursos_ano_reais: 160000,
    biodigestores: 10, demanda_lenha_sem_manejo_m3_ano: 40800,
    taxa_regeneracao_pct_ano: 2.9, eficiencia_conversao_energetica_pct: 36.0,
  },
  {
    municipio: "Cascavel", estado: "CE", area_km2: 835, populacao: 73123,
    IPSE: 0.32, IB: 0.35, IVS: 0.30, IIE: 0.32, IGL: 0.33,
    cobertura_arborea_pct: 22.0, estoque_biomassa_t_ha: 11.2,
    area_sistemas_integrados_pct: 10.5, acordos_manejo_ativos: 2,
    participacao_comunitaria_pct: 22.0, psa_recursos_ano_reais: 62000,
    biodigestores: 3, demanda_lenha_sem_manejo_m3_ano: 52000,
    taxa_regeneracao_pct_ano: 1.8, eficiencia_conversao_energetica_pct: 25.0,
  },
];

export const ipseHistorico = [
  { ano: 2020, valor: 0.38 },
  { ano: 2021, valor: 0.42 },
  { ano: 2022, valor: 0.47 },
  { ano: 2023, valor: 0.51 },
  { ano: 2024, valor: 0.54 },
];

export const especiesNativas = [
  { especie: "Sabiá", nomeCientifico: "Mimosa caesalpiniifolia", biomassa: 12.4, status: "Manejada" },
  { especie: "Catingueira", nomeCientifico: "Poincianella pyramidalis", biomassa: 9.8, status: "Monitorada" },
  { especie: "Juazeiro", nomeCientifico: "Ziziphus joazeiro", biomassa: 8.1, status: "Conservada" },
  { especie: "Angico", nomeCientifico: "Anadenanthera colubrina", biomassa: 15.2, status: "Manejada" },
  { especie: "Jurema-preta", nomeCientifico: "Mimosa tenuiflora", biomassa: 7.3, status: "Manejada" },
];

export function getAlerts(m: Municipio): string[] {
  const alerts: string[] = [];
  if (m.IVS < 0.5) alerts.push(`Vulnerabilidade socioeconômica elevada (IVS: ${m.IVS.toFixed(2)}). Priorizar programas de transferência de renda e acesso energético.`);
  if (m.cobertura_arborea_pct < 40) alerts.push(`Cobertura arbórea abaixo da meta (${m.cobertura_arborea_pct}% vs meta de 40%). Ampliar áreas de restauração biocultural.`);
  if (m.IGL < 0.5) alerts.push(`Governança local frágil (IGL: ${m.IGL.toFixed(2)}). Fortalecer conselhos territoriais e acordos de manejo.`);
  if (m.area_sistemas_integrados_pct < 30) alerts.push(`Baixa adoção de sistemas integrados (${m.area_sistemas_integrados_pct}%). Incentivar SAFs e ILPF.`);
  if (m.eficiencia_conversao_energetica_pct < 40) alerts.push(`Eficiência energética baixa (${m.eficiencia_conversao_energetica_pct}%). Investir em biodigestores e fogões eficientes.`);
  return alerts;
}

export function calcIPSE(ib: number, ivs: number, iie: number, igl: number, w = [0.30, 0.25, 0.25, 0.20]) {
  return w[0] * ib + w[1] * ivs + w[2] * iie + w[3] * igl;
}
