import requests
import json

MAPBIOMAS_API = "https://plataforma.alerta.mapbiomas.org/api/v2/graphql"
EMAIL = "hamiltonn38@alu.ufc.br"
PASSWORD = "Branquinha1!"

login_query = """
mutation SignIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    token
  }
}
"""
r = requests.post(
    MAPBIOMAS_API,
    headers={"Content-Type": "application/json"},
    json={"query": login_query, "variables": {"email": EMAIL, "password": PASSWORD}}
)
token = r.json()["data"]["signIn"]["token"]

intro_query = """
query {
  __type(name: "Query") {
    fields {
      name
      args {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
}
"""

r2 = requests.post(
    MAPBIOMAS_API,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    json={"query": intro_query}
)

fields = r2.json()["data"]["__type"]["fields"]
for f in fields:
    if f["name"] in ["alerts", "territories", "territory", "search"]:
        print(f"Field {f['name']}:")
        for a in f["args"]:
            print(f"   arg: {a['name']}")
