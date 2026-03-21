/**
 * Proxy server for MapBiomas Alerta API
 * 
 * This server keeps credentials on the server side, 
 * never exposing them to the browser bundle.
 * 
 * Security features:
 *   - CORS restricted to allowed origins (env ALLOWED_ORIGINS)
 *   - Rate limiting per IP (30 req/min)
 *   - Server-side credential management
 * 
 * Endpoints:
 *   POST /api/proxy/mapbiomas/signin  — authenticates and returns a token
 *   POST /api/proxy/mapbiomas/query   — proxies authenticated GraphQL queries
 * 
 * Environment variables (in .env, WITHOUT the VITE_ prefix):
 *   MAPBIOMAS_EMAIL
 *   MAPBIOMAS_PASSWORD
 *   ALLOWED_ORIGINS  — comma-separated list of allowed CORS origins (default: http://localhost:8080)
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually (no external deps needed)
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  const vars = {};
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
  } catch {}
  return vars;
}

const env = loadEnv();
const MAPBIOMAS_EMAIL = (env.MAPBIOMAS_EMAIL || process.env.MAPBIOMAS_EMAIL || "").trim();
const MAPBIOMAS_PASSWORD = (env.MAPBIOMAS_PASSWORD || process.env.MAPBIOMAS_PASSWORD || "").trim();
const MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql";
const PORT = parseInt(env.PROXY_PORT || process.env.PROXY_PORT || "3001", 10);

// ---- CORS Allowed Origins ----
const ALLOWED_ORIGINS_RAW = env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || "http://localhost:8080,http://localhost:5173";
const ALLOWED_ORIGINS = new Set(ALLOWED_ORIGINS_RAW.split(",").map((s) => s.trim()).filter(Boolean));

function isOriginAllowed(origin) {
  if (!origin) return false; // block requests with no origin (e.g. curl, scripts)
  return ALLOWED_ORIGINS.has(origin);
}

function getCorsHeaders(req) {
  const origin = req.headers.origin || "";
  if (isOriginAllowed(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };
  }
  return {
    "Vary": "Origin",
  };
}

// ---- Rate Limiting (in-memory, per IP) ----
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 requests per window
const rateLimitMap = new Map();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function isRateLimited(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry = { windowStart: now, count: 1 };
    rateLimitMap.set(ip, entry);
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// ---- Token management (server-side only) ----
let cachedToken = null;
let tokenExpiry = 0;
const TOKEN_TTL = 55 * 60 * 1000; // refresh every 55 min

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  if (!MAPBIOMAS_EMAIL || !MAPBIOMAS_PASSWORD) {
    throw new Error("Server: MAPBIOMAS_EMAIL and MAPBIOMAS_PASSWORD must be set in .env");
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
      variables: { email: MAPBIOMAS_EMAIL, password: MAPBIOMAS_PASSWORD },
    }),
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`MapBiomas signIn failed: ${json.errors[0].message}`);
  }

  const token = json.data?.signIn?.token;
  if (!token) throw new Error("MapBiomas signIn: no token returned");

  cachedToken = token;
  tokenExpiry = Date.now() + TOKEN_TTL;
  return token;
}

// ---- HTTP helpers ----
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    const MAX_BODY_SIZE = 1024 * 100; // 100KB max body

    req.on("data", (chunk) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        req.destroy();
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function jsonResponse(res, statusCode, body, corsHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...corsHeaders,
  });
  res.end(JSON.stringify(body));
}

// ---- Server ----
const server = http.createServer(async (req, res) => {
  const corsHeaders = getCorsHeaders(req);

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(req.headers.origin)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  // Rate limiting (applies to all non-OPTIONS requests)
  if (isRateLimited(req)) {
    return jsonResponse(res, 429, { error: "Too many requests. Try again later." }, corsHeaders);
  }

  // Health check
  if (req.url === "/api/proxy/health" && req.method === "GET") {
    return jsonResponse(res, 200, { 
      status: "ok", 
      hasCredentials: !!(MAPBIOMAS_EMAIL && MAPBIOMAS_PASSWORD) 
    }, corsHeaders);
  }

  // POST /api/proxy/mapbiomas/query — proxy GraphQL queries with server-side auth
  if (req.url === "/api/proxy/mapbiomas/query" && req.method === "POST") {
    // Enforce CORS: reject requests from non-allowed origins
    if (!isOriginAllowed(req.headers.origin)) {
      return jsonResponse(res, 403, { error: "Origin not allowed" });
    }

    try {
      const body = await readBody(req);
      const { query, variables } = JSON.parse(body);

      const token = await getToken();

      const apiRes = await fetch(MAPBIOMAS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      const apiJson = await apiRes.json();

      // If token expired, retry once
      if (
        apiJson.errors?.length &&
        apiJson.errors[0].message.toLowerCase().match(/auth|token|unauthorized/)
      ) {
        cachedToken = null;
        const newToken = await getToken();
        const retryRes = await fetch(MAPBIOMAS_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify({ query, variables }),
        });
        const retryJson = await retryRes.json();
        return jsonResponse(res, 200, retryJson, corsHeaders);
      }

      return jsonResponse(res, 200, apiJson, corsHeaders);
    } catch (err) {
      console.error("[proxy] query error:", err);
      return jsonResponse(res, 500, { errors: [{ message: "Internal server error" }] }, corsHeaders);
    }
  }

  jsonResponse(res, 404, { error: "Not found" }, corsHeaders);
});

server.listen(PORT, () => {
  console.log(`\n🛡️  MapBiomas Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Credentials: ${MAPBIOMAS_EMAIL ? "✓ configured" : "✗ NOT SET (check .env)"}`);
  console.log(`   Allowed Origins: ${[...ALLOWED_ORIGINS].join(", ")}`);
  console.log(`   Rate Limit: ${RATE_LIMIT_MAX} req/min per IP`);
  console.log(`   Endpoint:    POST http://localhost:${PORT}/api/proxy/mapbiomas/query\n`);
});
