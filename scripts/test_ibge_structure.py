import json

def get_sidra_val(data, mun_code, var_code=None, cat_codes=None):
    if not data or len(data) <= 1:
        return None
    for row in data[1:]:
        # Verificar se município está na linha
        has_mun = any(row.get(k) == str(mun_code) for k in row.keys() if k.endswith('C'))
        if not has_mun:
            continue
        if var_code and str(row.get('D2C')) != str(var_code):
            continue
        if cat_codes:
            row_c_vals = {str(v) for k, v in row.items() if k.endswith('C') and k not in ['D1C', 'D2C']}
            if not all(str(c) in row_c_vals for c in cat_codes):
                continue
        val_str = str(row.get('V', '')).strip().replace(',', '.')
        if val_str in ['..', '-', '...', 'X']:
            return 0
        try:
            return float(val_str) if '.' in val_str else int(val_str)
        except:
            return val_str
    return None

with open('data/raw/ibge_censo2022_pop_area.json', 'r', encoding='utf-8') as f:
    pop_data = json.load(f)

with open('data/raw/ibge_pevs_lenha.json', 'r', encoding='utf-8') as f:
    pevs_data = json.load(f)

with open('data/raw/ibge_censoagro2017_utilizacao_terras.json', 'r', encoding='utf-8') as f:
    agro_data = json.load(f)

print("Quixadá População:", get_sidra_val(pop_data, "2311306", var_code="93"))
print("Quixadá Área:", get_sidra_val(pop_data, "2311306", var_code="6318"))
print("Quixadá Lenha PEVS:", get_sidra_val(pevs_data, "2311306", var_code="144", cat_codes=["3434"]))
print("Quixadá SAFs Censo Agro:", get_sidra_val(agro_data, "2311306", var_code="184", cat_codes=["113476"]))
