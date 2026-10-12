import requests

MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"
EMAIL = "hamiltonn38@alu.ufc.br"
PASSWORD = "Branquinha1!"

r = requests.post(
    MAPBIOMAS_API,
    headers={"Content-Type": "application/json"},
    json={"query": "mutation SignIn($e: String!, $p: String!) { signIn(email: $e, password: $p) { token } }", "variables": {"e": EMAIL, "p": PASSWORD}}
)
token = r.json()["data"]["signIn"]["token"]

intro_query = """
query {
  __type(name: "Query") {
    fields {
      name
    }
  }
}
"""
r2 = requests.post(MAPBIOMAS_API, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}, json={"query": intro_query})
for f in r2.json()["data"]["__type"]["fields"]:
    print(f["name"])
