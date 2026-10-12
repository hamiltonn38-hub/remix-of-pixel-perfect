import requests
import re

content = requests.get('https://tempo.inmet.gov.br/static/js/main.15ddd492.chunk.js').text
matches = re.findall(r'"N\d+"', content)
print("Normal codes:", set(matches))
