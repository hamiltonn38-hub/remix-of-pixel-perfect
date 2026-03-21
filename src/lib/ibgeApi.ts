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

// ---- Cache with TTL and max size (LRU-style eviction) ----
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX_ENTRIES = 200;

interface CacheEntry<T = unknown> {
  data: T;
  ts: number;
}

const cache = new Map<string, CacheEntry>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function cacheSet<T>(key: string, data: T): void {
  // Evict oldest entries if at capacity
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { data, ts: Date.now() });
}

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cacheGet<T>(url);
  if (cached !== undefined) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IBGE API error: ${res.status}`);
  const data = await res.json();
  cacheSet(url, data);
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

export async function getMunicipioMetadados(municipioId: number): Promise<{ area: number | null, lat: number | null, lng: number | null }> {
  try {
    const data = await fetchWithCache<any[]>(
      `${IBGE_BASE}/v3/malhas/municipios/${municipioId}/metadados`
    );
    if (!data || data.length === 0) return { area: null, lat: null, lng: null };
    
    const meta = data[0];
    const area = meta.area?.dimensao ? parseFloat(meta.area.dimensao) : null;
    const lat = meta.centroide?.latitude ?? null;
    const lng = meta.centroide?.longitude ?? null;
    
    return { area, lat, lng };
  } catch {
    return { area: null, lat: null, lng: null };
  }
}

export async function getMunicipioIBGE(nome: string, uf: string) {
  const municipios = await searchMunicipios(uf);
  const found = municipios.find(
    (m) => m.nome.toLowerCase() === nome.toLowerCase()
  );
  if (!found) return null;

  const [populacao, metadados] = await Promise.all([
    getMunicipioPopulacao(found.id),
    getMunicipioMetadados(found.id),
  ]);

  return {
    ibgeId: found.id,
    nome: found.nome,
    mesorregiao: found.microrregiao.mesorregiao.nome,
    populacao,
    area_km2: metadados.area,
    latitude: metadados.lat,
    longitude: metadados.lng,
  };
}
