const IBGE_BASE = "https://servicodados.ibge.gov.br/api";

async function testArea() {
  const quixadaId = 2311306;
  const res = await fetch(`${IBGE_BASE}/v3/malhas/municipios/${quixadaId}/metadados`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testArea().catch(console.error);
