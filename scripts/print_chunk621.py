import requests

url = "https://plataforma.alerta.mapbiomas.org/static/js/621.d3da6999.chunk.js"
content = requests.get(url).text
print(content[:1000])
