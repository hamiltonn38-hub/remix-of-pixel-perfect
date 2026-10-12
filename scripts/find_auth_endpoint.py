import requests
import re

content = requests.get('https://plataforma.alerta.mapbiomas.org/static/js/main.9df098dd.chunk.js').text
matches = re.findall(r'["\'](https?://[^"\']*(?:graphql|api)[^"\']*)["\']', content)
print("GraphQL / API URLs in main chunk:")
for m in set(matches):
    print(" ", m)

# Find uri: or uri :
uris = re.findall(r'uri\s*:\s*["\']([^"\']+)["\']', content)
print("URIs in main chunk:")
for u in set(uris):
    print(" ", u)
