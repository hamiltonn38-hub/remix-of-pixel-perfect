/**
 * Vercel Serverless Function — MapBiomas Proxy
 *
 * Rota: POST /api/proxy/mapbiomas/query
 *
 * Mantém as credenciais no servidor (nunca expostas ao bundle do browser).
 * Configure as variáveis de ambiente no painel do Vercel:
 *   MAPBIOMAS_EMAIL
 *   MAPBIOMAS_PASSWORD
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql";
const TOKEN_TTL = 55 * 60 * 1000;

// Cache de token em memória (por instância de função — suficiente para produção)
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.MAPBIOMAS_EMAIL;
  const password = process.env.MAPBIOMAS_PASSWORD;

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
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
    return res.status(500).json({ errors: [{ message: err.message }] });
  }
}
