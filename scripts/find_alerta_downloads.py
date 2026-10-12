import requests

content = requests.get('https://plataforma.alerta.mapbiomas.org/static/js/main.9df098dd.chunk.js').text
pos = content.find("downloads")
while pos != -1:
    print(content[max(0, pos-100):min(len(content), pos+200)])
    print("="*40)
    pos = content.find("downloads", pos+10)
