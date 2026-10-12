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

for test_id in [17102, 21161, 16712, 15941]:
    q = f"""
    query {{
      alerts(territoryCategory: "city", territoryIds: [{test_id}], limit: 1) {{
        collection {{
          alertCode
          sources
        }}
      }}
    }}
    """
    res = requests.post(MAPBIOMAS_API, headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"}, json={"query": q})
    alerts = res.json().get("data", {}).get("alerts", {}).get("collection", [])
    src = alerts[0]["sources"] if alerts else "None"
    print(f"Code {test_id} -> source: {src}")
