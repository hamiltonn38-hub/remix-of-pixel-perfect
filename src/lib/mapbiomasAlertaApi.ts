/**
 * MapBiomas Alerta API v2 — GraphQL Client
 * Fonte: https://plataforma.alerta.mapbiomas.org/api/v2/graphql
 *
 * Autentica via signIn mutation e consulta alertas de desmatamento
 * filtrados por código IBGE do município (territoryIds).
 *
 * Schema fields discovered via introspection:
 *   Query.alerts(territoryIds, limit, page, startDate, endDate, ...)
 *   Alert { alertCode, areaHa, detectedAt, publishedAt, sources,
 *           coordinates { latitude, longitude }, alertStatus { status } }
 */

const DIRECT_API_URL = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql";

// In development, route through the Vite proxy to avoid CORS.
const API_URL = import.meta.env.DEV ? "/api/mapbiomas" : DIRECT_API_URL;

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

interface SignInResponse {
  data?: { signIn: { token: string } };
  errors?: Array<{ message: string }>;
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

// ---- Auth ----

let cachedToken: string | null = null;
let retryCount = 0;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const email = import.meta.env.VITE_MAPBIOMAS_EMAIL;
  const password = import.meta.env.VITE_MAPBIOMAS_PASSWORD;

  if (!email || !password) {
    throw new Error("MapBiomas credentials not configured. Set VITE_MAPBIOMAS_EMAIL and VITE_MAPBIOMAS_PASSWORD in .env");
  }

  const signInQuery = `
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
      }
    }
  `;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: signInQuery,
      variables: { email, password },
    }),
  });

  const json: SignInResponse = await res.json();

  if (json.errors?.length) {
    throw new Error(`MapBiomas signIn failed: ${json.errors[0].message}`);
  }

  const token = json.data?.signIn?.token;
  if (!token) throw new Error("MapBiomas signIn: no token returned");

  cachedToken = token;
  retryCount = 0;
  return token;
}

// ---- Cache ----

const alertsCache = new Map<string, { data: MapBiomasAlerta[]; ts: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

// ---- Main query ----

/**
 * Busca alertas de desmatamento publicados para um município pelo código IBGE.
 * Usa a query `alerts` com filtro `territoryIds`.
 */
export async function fetchAlertasMunicipio(
  codigoIBGE: string,
): Promise<MapBiomasAlerta[]> {
  // Check cache
  const cached = alertsCache.get(codigoIBGE);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const token = await getToken();

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

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: alertsQuery,
      variables: { territoryIds: [parseInt(codigoIBGE)], limit: 50 },
    }),
  });

  const json: AlertsQueryResponse = await res.json();

  if (json.errors?.length) {
    // If token expired, retry once
    if (
      retryCount < 1 &&
      (json.errors[0].message.toLowerCase().includes("auth") ||
        json.errors[0].message.toLowerCase().includes("token") ||
        json.errors[0].message.toLowerCase().includes("unauthorized"))
    ) {
      cachedToken = null;
      retryCount++;
      return fetchAlertasMunicipio(codigoIBGE);
    }
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
 * Limpa o cache e token (para testes ou logout).
 */
export function clearMapBiomasCache() {
  alertsCache.clear();
  cachedToken = null;
  retryCount = 0;
}


