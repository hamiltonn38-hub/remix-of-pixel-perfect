import requests
import json

MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"
EMAIL = "hamiltonn38@alu.ufc.br"
PASSWORD = "Branquinha1!"

r = requests.post(
    MAPBIOMAS_API,
    headers={"Content-Type": "application/json"},
    json={"query": "mutation SignIn($e: String!, $p: String!) { signIn(email: $e, password: $p) { token } }", "variables": {"e": EMAIL, "p": PASSWORD}}
)
token = r.json()["data"]["signIn"]["token"]

q = """
query {
  territoryOptions {
    category
    territories {
      code
      name
    }
  }
}
"""
r2 = requests.post(MAPBIOMAS_API, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}, json={"query": q})
with open("data/raw/territory_options_raw.json", "w", encoding="utf-8") as f:
    f.write(r2.text)
print("Saved territory options raw! Length:", len(r2.text))
