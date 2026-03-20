/**
 * Proxy server for MapBiomas Alerta API
 * 
 * This server keeps credentials on the server side, 
 * never exposing them to the browser bundle.
 * 
 * Endpoints:
 *   POST /api/proxy/mapbiomas/signin  — authenticates and returns a token
 *   POST /api/proxy/mapbiomas/query   — proxies authenticated GraphQL queries
 * 
 * Environment variables (in .env, WITHOUT the VITE_ prefix):
 *   MAPBIOMAS_EMAIL
 *   MAPBIOMAS_PASSWORD
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
const MAPBIOMAS_EMAIL = env.MAPBIOMAS_EMAIL || process.env.MAPBIOMAS_EMAIL || "";
const MAPBIOMAS_PASSWORD = env.MAPBIOMAS_PASSWORD || process.env.MAPBIOMAS_PASSWORD || "";
const MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql";
const PORT = parseInt(env.PROXY_PORT || process.env.PROXY_PORT || "3001", 10);

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
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

// ---- Server ----
const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // Health check
  if (req.url === "/api/proxy/health" && req.method === "GET") {
    return jsonResponse(res, 200, { 
      status: "ok", 
      hasCredentials: !!(MAPBIOMAS_EMAIL && MAPBIOMAS_PASSWORD) 
    });
  }

  // POST /api/proxy/mapbiomas/query — proxy GraphQL queries with server-side auth
  if (req.url === "/api/proxy/mapbiomas/query" && req.method === "POST") {
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
        return jsonResponse(res, 200, retryJson);
      }

      return jsonResponse(res, 200, apiJson);
    } catch (err) {
      console.error("[proxy] query error:", err);
      return jsonResponse(res, 500, { errors: [{ message: err.message }] });
    }
  }

  jsonResponse(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`\n🛡️  MapBiomas Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Credentials: ${MAPBIOMAS_EMAIL ? "✓ configured" : "✗ NOT SET (check .env)"}`);
  console.log(`   Endpoint:    POST http://localhost:${PORT}/api/proxy/mapbiomas/query\n`);
});
