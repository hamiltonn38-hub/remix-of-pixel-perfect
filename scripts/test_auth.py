import requests

urls = [
    "https://plataforma.alerta.mapbiomas.org/api/v1/auth/sign_in",
    "https://plataforma.alerta.mapbiomas.org/api/v1/users/sign_in",
    "https://plataforma.alerta.mapbiomas.org/api/v1/auth/login",
    "https://plataforma.alerta.mapbiomas.org/api/v1/login",
    "https://plataforma.alerta.mapbiomas.org/api/v1/authenticate",
    "https://alerta.mapbiomas.org/wp-json/jwt-auth/v1/token",
    "https://alerta.mapbiomas.org/wp-login.php"
]

for u in urls:
    try:
        r = requests.post(u, json={"email": "test@test.com", "password": "test"}, timeout=5)
        print(f"{r.status_code} ({len(r.text)}b) -> {u}")
        if r.status_code not in [404, 405]:
            print("   Response:", r.text[:200])
    except Exception as e:
        print(f"Err {u}: {e}")
