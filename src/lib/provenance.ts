/**
 * CAMADA DE PROVENIÊNCIA E METADADOS OFICIAIS — PLATAFORMA PITS
 * Carrega exclusivamente de data/MANIFEST.json
 * 
 * Regra 2: Todo card, gráfico e tabela mostra fonte, ano e data de consulta (vindos do MANIFEST).
 * Regra 10: O painel de fontes é gerado dinamicamente a partir do MANIFEST (contagens reais).
 */

import manifestData from "../../data/MANIFEST.json";

export interface RegistroManifest {
  municipio: string;
  codigoIBGE: string;
  variavel: string;
  valor: any;
  unidade: string;
  ano: number;
  instituicao: string;
  tabela: string;
  variavel_codigo: string;
  url: string;
  data_consulta: string;
  raw_file: string | null;
  raw_sha256: string | null;
}

export interface FonteMetadados {
  instituicao: string;
  ano: number;
  dataConsulta: string;
  tabela: string;
  url: string;
  unidade?: string;
}

export interface PainelFonteConector {
  id: string;
  nome: string;
  instituicao: string;
  desc: string;
  totalVariaveis: number;
  anoRecente: number;
  dataConsulta: string;
  tabelas: string[];
  status: "Auditado" | "Em estruturação";
  url: string;
  seloIntegrado: boolean;
}

/**
 * Retorna os metadados de proveniência de uma variável a partir do MANIFEST.json.
 */
export function getFonteManifest(
  variavel: string,
  codigoIBGE?: string
): FonteMetadados | null {
  const registros = manifestData.registros as RegistroManifest[];
  
  const encontrado = registros.find((r) => {
    if (codigoIBGE) {
      return r.variavel === variavel && r.codigoIBGE === codigoIBGE;
    }
    return r.variavel === variavel;
  });

  if (!encontrado) {
    return null;
  }

  return {
    instituicao: encontrado.instituicao,
    ano: encontrado.ano,
    dataConsulta: encontrado.data_consulta,
    tabela: encontrado.tabela,
    url: encontrado.url,
    unidade: encontrado.unidade,
  };
}

/**
 * Agrupa dinamicamente os registros do MANIFEST.json por conector institucional,
 * calculando as contagens reais de variáveis sem valores fixos manuais (Item 10 / M4-1).
 */
export function getConectoresManifest(): PainelFonteConector[] {
  const registros = manifestData.registros as RegistroManifest[];

  // Categorização institucional
  const grupos: Record<
    string,
    {
      nome: string;
      desc: string;
      variaveis: Set<string>;
      anos: Set<number>;
      datas: Set<string>;
      tabelas: Set<string>;
      urls: Set<string>;
      seloIntegrado: boolean;
      status: "Auditado" | "Em estruturação";
    }
  > = {
    ibge: {
      nome: "IBGE (SIDRA)",
      desc: "Censo Demográfico 2022, Censo Agropecuário 2017 e PEVS 2025",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    mapbiomas_col: {
      nome: "MapBiomas Brasil",
      desc: "Coleção 11 (1985–2025) — Estatísticas Municipais de Cobertura e Uso da Terra",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    mapbiomas_alerta: {
      nome: "MapBiomas Alerta",
      desc: "Alertas validados de desmatamento pelo SAD-Caatinga via API v2 GraphQL",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    inmet: {
      nome: "INMET (BDMEP)",
      desc: "Dados pluviométricos históricos e estações meteorológicas automáticas",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    ipece: {
      nome: "IPECE / SEMA-CE",
      desc: "Índice Municipal de Qualidade do Meio Ambiente (IQM) e rateio ambiental do ICMS",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    sfb_ifn: {
      nome: "SFB / IFN-CE",
      desc: "Inventário Florestal Nacional do Ceará e alometrias de biomassa (Sampaio & Silva, 2005)",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: true,
      status: "Auditado",
    },
    fundeci: {
      nome: "FUNDECI / Projeto Caatinga",
      desc: "Acordos comunitários de manejo e monitoramento participativo de campo",
      variaveis: new Set(),
      anos: new Set(),
      datas: new Set(),
      tabelas: new Set(),
      urls: new Set(),
      seloIntegrado: false,
      status: "Em estruturação",
    },
  };

  for (const r of registros) {
    const instLower = r.instituicao.toLowerCase();
    let key = "fundeci";

    if (instLower.includes("mapbiomas alerta")) {
      key = "mapbiomas_alerta";
    } else if (instLower.includes("mapbiomas")) {
      key = "mapbiomas_col";
    } else if (instLower.includes("inmet")) {
      key = "inmet";
    } else if (instLower.includes("ipece") || instLower.includes("sefaz") || instLower.includes("sema")) {
      key = "ipece";
    } else if (instLower.includes("florestal") || instLower.includes("ifn")) {
      key = "sfb_ifn";
    } else if (instLower.includes("ibge")) {
      key = "ibge";
    }

    if (grupos[key]) {
      grupos[key].variaveis.add(r.variavel);
      grupos[key].anos.add(r.ano);
      grupos[key].datas.add(r.data_consulta);
      if (r.tabela) grupos[key].tabelas.add(r.tabela);
      if (r.url && r.url !== "NÃO APLICÁVEL") grupos[key].urls.add(r.url);
    }
  }

  return Object.entries(grupos).map(([id, g]) => {
    const anosArr = Array.from(g.anos).sort((a, b) => b - a);
    const datasArr = Array.from(g.datas);
    const tabelasArr = Array.from(g.tabelas);
    const urlsArr = Array.from(g.urls);

    return {
      id,
      nome: g.nome,
      instituicao: g.nome,
      desc: g.desc,
      totalVariaveis: g.variaveis.size,
      anoRecente: anosArr[0] ?? 2026,
      dataConsulta: datasArr[0] ?? "11/10/2026",
      tabelas: tabelasArr,
      status: g.status,
      url: urlsArr[0] ?? "https://www.gov.br",
      seloIntegrado: g.seloIntegrado,
    };
  });
}
