/**
 * MapBiomas Alerta API v2 — Secure Client
 * 
 * This client NEVER handles credentials directly.
 * Authentication is handled by the proxy server (server/proxy.mjs).
 * 
 * In development: requests go through Vite proxy → local proxy server
 * In production:  requests go through the deployed proxy server
 * 
 * The proxy server authenticates with MapBiomas and forwards
 * the GraphQL query with the server-side token.
 */

// The proxy endpoint handles auth server-side
const PROXY_URL = "/api/proxy/mapbiomas/query";

// ---- Types ----

export interface MapBiomasAlerta {
  alertCode: string;
  areaHa: number;
  detectedAt: string;
  publishedAt: string;
  source: string;
  statusLabel: string;
  biome: string;
  centroid: { lat: number; lng: number } | null;
}

interface RawAlert {
  alertCode: number;
  areaHa: number;
  detectedAt: string;
  publishedAt: string;
  sources: string[] | null;
  coordenates: { latitude: number; longitude: number } | null;
  statusName: string | null;
}

interface AlertsQueryResponse {
  data?: { alerts: { collection: RawAlert[] } | null };
  errors?: Array<{ message: string }>;
}

// ---- Cache ----

const alertsCache = new Map<string, { data: MapBiomasAlerta[]; ts: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

// ---- Main query ----

/**
 * Busca alertas de desmatamento publicados para um município pelo código IBGE.
 * A autenticação é feita inteiramente pelo servidor proxy.
 */
export async function fetchAlertasMunicipio(
  codigoIBGE: string,
): Promise<MapBiomasAlerta[]> {
  // Check cache
  const cached = alertsCache.get(codigoIBGE);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const alertsQuery = `
    query Alerts($territoryIds: [Int!], $limit: Int) {
      alerts(territoryIds: $territoryIds, limit: $limit) {
        collection {
          alertCode
          areaHa
          detectedAt
          publishedAt
          sources
          coordenates {
            latitude
            longitude
          }
          statusName
        }
      }
    }
  `;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: alertsQuery,
      variables: { territoryIds: [parseInt(codigoIBGE)], limit: 50 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Proxy server error: ${res.status} ${res.statusText}`);
  }

  const json: AlertsQueryResponse = await res.json();

  if (json.errors?.length) {
    throw new Error(`MapBiomas Alerta query error: ${json.errors[0].message}`);
  }

  const rawAlerts = json.data?.alerts?.collection ?? [];

  const alerts: MapBiomasAlerta[] = rawAlerts.map((a) => ({
    alertCode: a.alertCode?.toString() ?? "—",
    areaHa: a.areaHa ?? 0,
    detectedAt: a.detectedAt ?? "",
    publishedAt: a.publishedAt ?? "",
    source: a.sources?.join(", ") ?? "Desconhecida",
    statusLabel: a.statusName ?? "Publicado",
    biome: "Caatinga",
    centroid:
      a.coordenates?.latitude && a.coordenates?.longitude
        ? { lat: a.coordenates.latitude, lng: a.coordenates.longitude }
        : null,
  }));

  alertsCache.set(codigoIBGE, { data: alerts, ts: Date.now() });
  return alerts;
}

/**
 * Limpa o cache (para testes ou logout).
 */
export function clearMapBiomasCache() {
  alertsCache.clear();
}
