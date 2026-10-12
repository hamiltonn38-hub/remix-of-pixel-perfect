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
  alerts(territoryCategory: "city", territoryIds: [16656], limit: 5) {
    collection {
      alertCode
      areaHa
      detectedAt
      publishedAt
      statusName
      sources
    }
  }
}
"""
r2 = requests.post(MAPBIOMAS_API, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}, json={"query": q})
print("Alerts for Quixadá (16656):")
print(json.dumps(r2.json(), indent=2))
