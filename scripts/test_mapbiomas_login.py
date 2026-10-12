import requests
import json

MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"
EMAIL = "hamiltonn38@alu.ufc.br"
PASSWORD = "Branquinha1!"

query = """
mutation SignIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    token
  }
}
"""

print(f"Tentando login no MapBiomas com {EMAIL}...")
r = requests.post(
    MAPBIOMAS_API,
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    json={"query": query, "variables": {"email": EMAIL, "password": PASSWORD}},
    timeout=20
)

print(f"Status: {r.status_code}")
data = r.json()
print("Resposta:", json.dumps(data, indent=2))

if "data" in data and data["data"].get("signIn"):
    token = data["data"]["signIn"]["token"]
    print(f"\n[SUCESSO] Token obtido: {token[:20]}...{token[-10:]}")
