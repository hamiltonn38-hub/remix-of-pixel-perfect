import urllib.request, traceback

url = "https://doi.org/10.1590/S0102-33062005000400028"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print("Status:", resp.getcode())
        print("URL:", resp.geturl())
except Exception:
    traceback.print_exc()
