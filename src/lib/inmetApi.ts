/**
 * API Client para o INMET (Instituto Nacional de Meteorologia)
 * Fonte: https://apitempo.inmet.gov.br/
 */

const INMET_BASE = "https://apitempo.inmet.gov.br";

export interface EstacaoINMET {
  CD_ESTACAO: string;
  DC_NOME: string;
  SG_ESTADO: string;
  VL_LATITUDE: string;
  VL_LONGITUDE: string;
  CD_SITUACAO: string;
  distanciaKm?: number;
}

export interface AgregadoAnualINMET {
  ano: number;
  precipitacaoTotal: number;
}

// Haversine formula for distance between two points in km
function calculaDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 1. Fetch closest station
export async function getEstacaoMaisProxima(
  lat: number,
  lng: number,
  uf: string
): Promise<EstacaoINMET | null> {
  try {
    const res = await fetch(`${INMET_BASE}/estacoes/T`);
    const estacoes: EstacaoINMET[] = await res.json();

    // Tentar pegar só operantes do estado, senão só do estado
    let validas = estacoes.filter((e) => e.SG_ESTADO === uf && e.CD_SITUACAO === "Operante");
    if (validas.length === 0) validas = estacoes.filter((e) => e.SG_ESTADO === uf);
    
    if (validas.length === 0) return null;

    // Calcular distância
    const comDistancia = validas.map((e) => ({
      ...e,
      distanciaKm: calculaDistancia(lat, lng, parseFloat(e.VL_LATITUDE), parseFloat(e.VL_LONGITUDE)),
    }));

    // Retornar a mais próxima
    comDistancia.sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0));
    return comDistancia[0];
  } catch (error) {
    console.error("Erro ao buscar estações do INMET:", error);
    return null;
  }
}

// 2. Fetch daily data chunked by year
export async function getChuvaHistorica(
  cdEstacao: string, 
  startYear: number, 
  endYear: number
): Promise<AgregadoAnualINMET[]> {
  try {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const results: AgregadoAnualINMET[] = [];

    // Fazer requisições por ano (a API do INMET falha em intervalos muito longos)
    const promises = years.map(async (year) => {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      
      const res = await fetch(`${INMET_BASE}/estacao/diaria/${start}/${end}/${cdEstacao}`);
      if (!res.ok) throw new Error(`Status HTTP: ${res.status}`);
      const data = await res.json();
      
      let precipitacaoTotal = 0;
      if (Array.isArray(data)) {
        data.forEach(dia => {
          if (dia.CHUVA && dia.CHUVA !== "null") {
            const v = parseFloat(dia.CHUVA);
            if (!isNaN(v)) precipitacaoTotal += v;
          }
        });
      }
      
      return { ano: year, precipitacaoTotal: Math.round(precipitacaoTotal) };
    });

    const yearlyData = await Promise.all(promises);
    return yearlyData.sort((a, b) => a.ano - b.ano);
  } catch (error) {
    console.error("Erro ao buscar histórico do INMET:", error);
    return [];
  }
}
