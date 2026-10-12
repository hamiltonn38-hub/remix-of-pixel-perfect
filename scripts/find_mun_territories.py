import json

with open("data/raw/territory_options_raw.json", "r", encoding="utf-8") as f:
    data = json.load(f)

MUNICIPIOS = [
    "Quixadá", "Crateús", "Iguatu", "Sobral", "Juazeiro do Norte",
    "Crato", "Senador Pompeu", "Tauá", "Canindé", "Cascavel"
]

cats = data.get("data", {}).get("territoryOptions", [])
for c in cats:
    cat_name = c["category"]
    print(f"\nCategoria: {cat_name}")
    for t in c.get("territories", []):
        t_name = t["name"]
        for m in MUNICIPIOS:
            if m.lower() in t_name.lower():
                print(f"   {m} -> code={t['code']}, name={t_name}")
