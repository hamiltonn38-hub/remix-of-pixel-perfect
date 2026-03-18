export interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: { id: number; sigla: string; nome: string };
    };
  };
}

export interface IBGEPopulacao {
  id: string;
  variavel: string;
  resultados: Array<{
    series: Array<{
      localidade: { id: string; nome: string };
      serie: Record<string, string>;
    }>;
  }>;
}

const IBGE_BASE = "https://servicodados.ibge.gov.br/api";

// Cache to avoid repeated fetches
const cache = new Map<string, any>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IBGE API error: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function searchMunicipios(uf: string): Promise<IBGEMunicipio[]> {
  const ufs = await fetchWithCache<Array<{ id: number; sigla: string }>>(`${IBGE_BASE}/v1/localidades/estados`);
  const ufObj = ufs.find((u) => u.sigla === uf);
  if (!ufObj) return [];
  return fetchWithCache<IBGEMunicipio[]>(`${IBGE_BASE}/v1/localidades/estados/${ufObj.id}/municipios`);
}

export async function getMunicipioPopulacao(municipioId: number): Promise<number | null> {
  try {
    // Agregados: Populacao estimada (tabela 6579)
    const data = await fetchWithCache<IBGEPopulacao[]>(
      `${IBGE_BASE}/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${municipioId}]`
    );
    const series = data?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    if (!series) return null;
    const lastYear = Object.keys(series).sort().pop();
    return lastYear ? parseInt(series[lastYear]) : null;
  } catch {
    return null;
  }
}

export async function getMunicipioArea(municipioId: number): Promise<number | null> {
  try {
    const data = await fetchWithCache<any[]>(
      `${IBGE_BASE}/v3/malhas/municipios/${municipioId}/metadados`
    );
    if (!data || data.length === 0 || !data[0].area?.dimensao) return null;
    return parseFloat(data[0].area.dimensao);
  } catch {
    return null;
  }
}

export async function getMunicipioIBGE(nome: string, uf: string) {
  const municipios = await searchMunicipios(uf);
  const found = municipios.find(
    (m) => m.nome.toLowerCase() === nome.toLowerCase()
  );
  if (!found) return null;

  const [populacao, area] = await Promise.all([
    getMunicipioPopulacao(found.id),
    getMunicipioArea(found.id),
  ]);

  return {
    ibgeId: found.id,
    nome: found.nome,
    mesorregiao: found.microrregiao.mesorregiao.nome,
    populacao,
    area_km2: area,
  };
}
