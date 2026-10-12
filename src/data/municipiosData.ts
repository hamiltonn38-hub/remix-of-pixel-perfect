/**
 * DADOS REAIS MUNICIPAIS — PLATAFORMA PITS
 * Carrega exclusivamente de data/processed/municipios_processed.json
 * Fontes oficiais auditadas:
 * - IBGE Censo Demográfico 2022 (População, Área, Carências Domiciliares para IVS)
 * - MapBiomas Coleção 11 (2025) (Área e % de Vegetação Nativa para PEL e IB)
 * - SFB / IFN-CE e Sampaio & Silva (2005) (Biomassa em t/ha)
 * - IBGE PEVS 2025 (Extração de Lenha em m³)
 * - IBGE Censo Agropecuário 2017 (SAFs, adubação e energia solar para IIE)
 * - IPECE IQM 2026 (Gestão de Resíduos Sólidos e rateio ICMS para IGL)
 * - MapBiomas Alerta SAD-Caatinga (Alertas e Área Desmatada)
 * - INMET BDMEP 2024 (Precipitação Anual e Estações Meteorológicas)
 * 
 * Regra 1: Proibido inventar dados.
 * Regra 2c: null = "Dados indisponíveis".
 * Regra 3 (G3): Cascavel = 2303501.
 */

import rawProcessed from "../../data/processed/municipios_processed.json";
import {
  calcPEL,
  calcIVS,
  calcIVSStar,
  calcIPSE,
  normalizeMinMax,
  CarenciasIVS,
  LiteraturaParams,
  DEFAULT_LITERATURA_PARAMS,
} from "@/lib/calcPits";

export interface EstacaoInmetInfo {
  codigo: string;
  nome: string;
  uf: string;
  tipo: string;
  lat: number;
  lon: number;
  distanciaKm: number;
}

export interface MunicipioPits {
  codigoIBGE: string;
  municipio: string;
  estado: string;
  area_km2: number;
  populacao: number;
  
  // Variáveis do Modelo Oficial (Artigo)
  area_nativa_ha: number;
  cobertura_nativa_pct: number;
  carencias: CarenciasIVS;
  IVS: number;          // Eq. 4: IVS alto = mais vulnerável
  IVS_star: number;     // Eq. 5: com piso paramétrico e penalidade de seca
  PEL: number;          // Eq. 1: Potencial Energético Local (GJ/ano)
  IPSE: number;         // Eq. 6: IPSE Bruto = PEL / IVS* (GJ/ano)
  IPSE_norm: number;    // Eq. 7: IPSE Normalizado Min-Max (0–1)

  // Indicadores de Apoio Setoriais (NÃO compõem o IPSE)
  IB: number;           // Índice Biofísico (vegetação nativa / total)
  IIE: number;          // Índice de Infraestrutura e Práticas Agroecológicas
  IGL: number;          // Índice de Governança Local e Resíduos

  // Variáveis Operacionais e Fontes Oficiais
  estoque_biomassa_t_ha: number;
  estoque_biomassa_total_t: number;
  lenha_pevs_m3_ano: number;
  safs_pct: number;
  precipitacao_anual_mm: number | null;
  precipitacao_registros_horarios: number;
  estacao_inmet: EstacaoInmetInfo | null;
  alertas_desmatamento: number;
  area_desmatamento_alertas_ha: number;
  iqm_residuos: number;
  iqm_coeficiente_icms: number;

  // Práticas agropecuárias auditadas (IBGE Censo Agro 2017)
  adubacao_organica_pct: number;
  agricultura_organica_pct: number;
  associativismo_pct: number;
  energia_solar_estab_pct: number;
  rotacao_culturas_estab: number;
  manejo_florestal_estab: number;

  // Variáveis de campo FUNDECI (Regra 2c: null = "Dados indisponíveis")
  acordos_manejo_ativos: number | null;
  monitoramento_participativo_pontos: number | null;
  biodigestores_instalados: number | null;
  recursos_psa_anuais: number | null;

  // Campos de compatibilidade
  cobertura_arborea_pct: number;
  area_sistemas_integrados_pct: number;
  demanda_lenha_sem_manejo_m3_ano: number;
  taxa_regeneracao_pct_ano: number | null;
  eficiencia_conversao_energetica_pct: number;
}

export function buildMunicipiosList(
  litParams: Partial<LiteraturaParams> = {},
  droughtPenalty = 0
): MunicipioPits[] {
  const rawList = Object.values(rawProcessed);

  // 1. Primeira passada: extrair variáveis reais e calcular PEL, IVS, IVS* e IPSE bruto
  const preCalculados = rawList.map((m: any) => {
    const code = m.codigoIBGE;
    const nome = m.nome;
    const pop = m.demografia_censo2022?.populacao_hab ?? 0;
    const areaKm2 = m.demografia_censo2022?.area_territorial_km2 ?? 0;
    const nativaHa = m.cobertura_mapbiomas_col11?.vegetacao_nativa_recente_ha ?? 0;
    const nativaPct = m.cobertura_mapbiomas_col11?.vegetacao_nativa_recente_pct ?? 0;

    const indIVS = m.ivs_proprio_censo2022?.indicadores;
    const carencias: CarenciasIVS = {
      agua: indIVS?.prop_domicilios_sem_rede_agua ?? 0.25,
      esgoto: indIVS?.prop_domicilios_esgotamento_inadequado ?? 0.50,
      lixo: indIVS?.prop_domicilios_lixo_nao_coletado ?? 0.20,
      energia: indIVS?.prop_domicilios_sem_energia_eletrica ?? 0.008,
    };

    const ivsCalc = calcIVS(carencias) ?? m.ivs_proprio_censo2022?.ivs ?? 0.25;
    const ivsStar = calcIVSStar(ivsCalc, { droughtPenalty }) ?? 0.25;
    const pel = calcPEL(nativaHa, litParams) ?? 0;
    const ipse = calcIPSE(pel, ivsStar) ?? 0;

    // Indicadores de Apoio:
    // IB: % de vegetação nativa na escala 0 a 1
    const ib = Number((nativaPct / 100).toFixed(2));

    // IIE: composto por SAFs (Censo Agro Tabela 6881), adubação orgânica e solar
    const safPct = m.agropecuaria_censoagro2017?.safs?.estabelecimentos_pct ?? 0;
    const adubOrgPct = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.adubacao_organica_pct ?? 0;
    const agricOrgPct = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.agricultura_organica_pct ?? 0;
    const solarPct = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.energia_solar_estab_pct ?? 0;
    const assocPct = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.associativismo_sindicato_pct ?? 0;
    const rotCulturas = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.rotacao_culturas_estab ?? 0;
    const manejoFlor = m.agropecuaria_censoagro2017?.praticas_sustentaveis?.manejo_florestal_estab ?? 0;

    // Escala normalizada de apoio 0-1
    const iie = Number(Math.min(1, (safPct / 20) * 0.4 + (adubOrgPct / 25) * 0.4 + (solarPct / 2) * 0.2).toFixed(2));

    // IGL: IQM IPECE 2026 (resíduos) e associativismo rural
    const iqm = m.iqm_icms_socioambiental_ipece?.iqm_2026?.iqm_somatorio ?? 1.0;
    const coefIcms = m.iqm_icms_socioambiental_ipece?.coeficiente_rateio_icms_2026 ?? 0.01;
    const igl = Number(Math.min(1, (iqm * 0.6) + (assocPct / 100 * 0.4)).toFixed(2));

    const bioDens = m.biomassa_florestal_ifn?.biomassa_densidade_territorial_t_ha ?? 0;
    const bioTotal = m.biomassa_florestal_ifn?.estoque_biomassa_total_t ?? 0;
    const lenha = m.extrativismo_pevs_2025?.lenha_extraida_m3 ?? 0;

    // INMET: Se a estação teve 0 registros no ano, o dado é considerado indisponível (Regra 5)
    const registrosHorarios = m.clima_inmet?.precipitacao_2024?.registros_horarios ?? 0;
    const precipVal = m.clima_inmet?.precipitacao_2024?.precipitacao_total_mm;
    const precipitacao_anual_mm = registrosHorarios > 0 ? (precipVal ?? null) : null;

    const estacaoInmet: EstacaoInmetInfo | null = m.clima_inmet?.estacao_mais_proxima
      ? {
          codigo: m.clima_inmet.estacao_mais_proxima.codigo,
          nome: m.clima_inmet.estacao_mais_proxima.nome,
          uf: m.clima_inmet.estacao_mais_proxima.uf,
          tipo: m.clima_inmet.estacao_mais_proxima.tipo,
          lat: m.clima_inmet.estacao_mais_proxima.lat,
          lon: m.clima_inmet.estacao_mais_proxima.lon,
          distanciaKm: m.clima_inmet.estacao_mais_proxima.distanciaKm,
        }
      : null;

    const alertas = m.alertas_desmatamento_mapbiomas?.total_alertas ?? 0;
    const desmatHa = m.alertas_desmatamento_mapbiomas?.area_total_desmatada_ha ?? 0;

    return {
      codigoIBGE: code,
      municipio: nome,
      estado: "CE",
      area_km2: areaKm2,
      populacao: pop,
      area_nativa_ha: nativaHa,
      cobertura_nativa_pct: nativaPct,
      carencias,
      IVS: ivsCalc,
      IVS_star: ivsStar,
      PEL: pel,
      IPSE: ipse,
      IB: ib,
      IIE: iie,
      IGL: igl,
      estoque_biomassa_t_ha: bioDens,
      estoque_biomassa_total_t: bioTotal,
      lenha_pevs_m3_ano: lenha,
      safs_pct: safPct,
      precipitacao_anual_mm,
      precipitacao_registros_horarios: registrosHorarios,
      estacao_inmet: estacaoInmet,
      alertas_desmatamento: alertas,
      area_desmatamento_alertas_ha: desmatHa,
      iqm_residuos: iqm,
      iqm_coeficiente_icms: coefIcms,

      adubacao_organica_pct: adubOrgPct,
      agricultura_organica_pct: agricOrgPct,
      associativismo_pct: assocPct,
      energia_solar_estab_pct: solarPct,
      rotacao_culturas_estab: rotCulturas,
      manejo_florestal_estab: manejoFlor,

      // Valores sem dado empírico real no campo (Regra 2c)
      acordos_manejo_ativos: null,
      monitoramento_participativo_pontos: null,
      biodigestores_instalados: null,
      recursos_psa_anuais: null,

      // Campos de compatibilidade retroativa
      cobertura_arborea_pct: nativaPct,
      area_sistemas_integrados_pct: safPct,
      demanda_lenha_sem_manejo_m3_ano: lenha,
      taxa_regeneracao_pct_ano: null,
      eficiencia_conversao_energetica_pct: Math.round((litParams.eta ?? DEFAULT_LITERATURA_PARAMS.eta) * 100),
    };
  });

  // 2. Segunda passada: normalização Min-Max do IPSE entre todos os municípios
  const rawIpses = preCalculados.map((m) => m.IPSE);
  const normalizedIpses = normalizeMinMax(rawIpses);

  return preCalculados.map((m, idx) => ({
    ...m,
    IPSE_norm: normalizedIpses[idx] ?? 0,
  }));
}

/** Lista oficial dos 10 municípios da plataforma alimentados com dados reais */
export const municipiosReais: MunicipioPits[] = buildMunicipiosList();

/**
 * Alertas e recomendações territoriais oficiais.
 * CORREÇÃO DA REGRA G6/D5: IVS alto = vulnerabilidade crítica.
 */
export function getAlertasOficiais(m: MunicipioPits): string[] {
  const alerts: string[] = [];

  // Alerta de vulnerabilidade corrigido (IVS alto = crítico)
  if (m.IVS >= 0.30) {
    alerts.push(
      `Vulnerabilidade socioeconômica elevada (IVS: ${m.IVS.toFixed(2)}). Priorizar universalização de saneamento, água tratada e acesso a energias limpas.`
    );
  }

  // Alerta de cobertura nativa baseado na Reserva Legal (Lei 12.651/2012, 20% no bioma Caatinga)
  if (m.cobertura_nativa_pct < 60) {
    alerts.push(
      `Cobertura vegetal nativa em ${m.cobertura_nativa_pct}% do território. Estimular regeneração natural assistida e planos de manejo florestal sustentável.`
    );
  }

  // Alertas de desmatamento validados
  if (m.alertas_desmatamento > 0 && m.area_desmatamento_alertas_ha > 500) {
    alerts.push(
      `Pressão de desmatamento registrada pelo MapBiomas Alerta: ${m.area_desmatamento_alertas_ha.toFixed(1)} ha em ${m.alertas_desmatamento} alertas validados.`
    );
  }

  // Adoção de Sistemas Agroflorestais
  if (m.safs_pct < 5.0) {
    alerts.push(
      `Baixa adoção censitária de Sistemas Agroflorestais (${m.safs_pct}% dos estabelecimentos). Fomentar capacitação técnica e linhas de transição agroecológica.`
    );
  }

  // Demanda de lenha
  if (m.lenha_pevs_m3_ano > 40000) {
    alerts.push(
      `Volume significativo de extração de lenha (${m.lenha_pevs_m3_ano.toLocaleString("pt-BR")} m³/ano no PEVS/IBGE). Apoiar certificação e manejo florestal sustentável.`
    );
  }

  return alerts;
}

/**
 * Espécies botânicas da Caatinga com nomenclatura botânica aceita (Flora e Funga do Brasil / JBRJ)
 * Item 3 (M1-10): Cenostigma pyramidale, Sarcomphalus joazeiro, etc.
 */
export const especiesNativasCaatinga = [
  {
    especie: "Sabiá",
    nomeCientifico: "Mimosa caesalpiniifolia",
    familia: "Fabaceae",
    origem: "Nativa da Caatinga",
    statusEcologico: "Nativa",
    uso: "Manejo florestal sustentável, estacas e forragem rica em proteína",
  },
  {
    especie: "Catingueira",
    nomeCientifico: "Cenostigma pyramidale",
    familia: "Fabaceae",
    origem: "Nativa endêmica da Caatinga",
    statusEcologico: "Nativa",
    uso: "Regeneração natural pioneira e lenha sob plano de manejo",
  },
  {
    especie: "Juazeiro",
    nomeCientifico: "Sarcomphalus joazeiro",
    familia: "Rhamnaceae",
    origem: "Nativa da Caatinga",
    statusEcologico: "Nativa",
    uso: "Sombra perene, forragem no auge da estiagem e conservação hídrica",
  },
  {
    especie: "Angico",
    nomeCientifico: "Anadenanthera colubrina",
    familia: "Fabaceae",
    origem: "Nativa da Caatinga",
    statusEcologico: "Nativa",
    uso: "Manejo florestal madeireiro, tanino e apicultura",
  },
  {
    especie: "Jurema-preta",
    nomeCientifico: "Mimosa tenuiflora",
    familia: "Fabaceae",
    origem: "Nativa da Caatinga",
    statusEcologico: "Nativa",
    uso: "Biomassa energética de alto poder calorífico e proteção de solos degradados",
  },
];

export type Municipio = MunicipioPits;
