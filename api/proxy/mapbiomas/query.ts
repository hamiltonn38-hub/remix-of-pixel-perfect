/**
 * Vercel Serverless Function — MapBiomas Proxy
 *
 * Rota: POST /api/proxy/mapbiomas/query
 *
 * Mantém as credenciais no servidor (nunca expostas ao bundle do browser).
 * Configure as variáveis de ambiente no painel do Vercel:
 *   MAPBIOMAS_EMAIL
 *   MAPBIOMAS_PASSWORD
 *   ALLOWED_ORIGINS  — comma-separated list of allowed CORS origins
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql";
const TOKEN_TTL = 55 * 60 * 1000;

// ---- CORS ----
const ALLOWED_ORIGINS_RAW = process.env.ALLOWED_ORIGINS || "";
const ALLOWED_ORIGINS = new Set(
  ALLOWED_ORIGINS_RAW.split(",").map((s) => s.trim()).filter(Boolean)
);

function getAllowedOrigin(req: VercelRequest): string | null {
  const origin = (req.headers.origin as string) || "";
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return null;
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = getAllowedOrigin(req);
  res.setHeader("Vary", "Origin");

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return true;
  }
  return false;
}

// ---- Rate Limiting (per-instance in-memory) ----
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { windowStart: number; count: number }>();

function isRateLimited(req: VercelRequest): boolean {
  const ip =
    ((req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()) ||
    req.socket?.remoteAddress ||
    "unknown";
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 1 };
    rateLimitMap.set(ip, entry);
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ---- Token management ----
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.MAPBIOMAS_EMAIL?.trim();
  const password = process.env.MAPBIOMAS_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "MAPBIOMAS_EMAIL e MAPBIOMAS_PASSWORD devem estar configurados nas variáveis de ambiente do Vercel."
    );
  }

  const signInQuery = `
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
      }
    }
  `;

  const res = await fetch(MAPBIOMAS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: signInQuery,
      variables: { email, password },
    }),
  });

  const json = (await res.json()) as any;

  if (json.errors?.length) {
    throw new Error(`MapBiomas signIn falhou: ${json.errors[0].message}`);
  }

  const token = json.data?.signIn?.token;
  if (!token) throw new Error("MapBiomas signIn: nenhum token retornado");

  cachedToken = token;
  tokenExpiry = Date.now() + TOKEN_TTL;
  return token;
}

async function queryMapBiomas(query: string, variables: unknown, token: string) {
  const res = await fetch(MAPBIOMAS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsAllowed = setCorsHeaders(req, res);

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (!corsAllowed) return res.status(403).end("Forbidden");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Reject non-allowed origins
  if (!corsAllowed) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  // Rate limiting
  if (isRateLimited(req)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  try {
    const { query, variables } = req.body as { query: string; variables: unknown };

    if (!query) {
      return res.status(400).json({ error: "Campo 'query' é obrigatório." });
    }

    let token = await getToken();
    let data = await queryMapBiomas(query, variables, token);

    // Se o token expirou, reautentica uma vez
    const authError = data.errors?.some((e: any) =>
      /auth|token|unauthorized/i.test(e.message)
    );
    if (authError) {
      cachedToken = null;
      token = await getToken();
      data = await queryMapBiomas(query, variables, token);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("[proxy/mapbiomas/query]", err);
    return res.status(500).json({ errors: [{ message: "Internal server error" }] });
  }
}
