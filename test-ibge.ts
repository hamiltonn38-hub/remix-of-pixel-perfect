import { getMunicipioIBGE } from './src/lib/ibgeApi.js';

// As Vite uses TS, I'll write a simple node script using raw fetch just to verify the endpoints are up and returning expected shapes.

const IBGE_BASE = "https://servicodados.ibge.gov.br/api";

async function testIBGE() {
  console.log("Testing IBGE API...");
  
  // 1. Test UFs
  console.log("1. Fetching UFs...");
  const ufsRes = await fetch(`${IBGE_BASE}/v1/localidades/estados`);
  const ufs = await ufsRes.json();
  console.log(`- Found ${ufs.length} UFs. Example: ${ufs[0].sigla}`);
  
  // 2. Test Municipios from CE (23)
  console.log("\n2. Fetching Municipios for CE (23)...");
  const munRes = await fetch(`${IBGE_BASE}/v1/localidades/estados/23/municipios`);
  const municipios = await munRes.json();
  console.log(`- Found ${municipios.length} municipios. Example: ${municipios[0].nome} (ID: ${municipios[0].id})`);
  
  // Find Quixadá (2311306)
  const quixada = municipios.find((m: any) => m.nome === "Quixadá");
  
  if (quixada) {
    // 3. Test Populacao (Agregado 6579)
    console.log(`\n3. Fetching population for ${quixada.nome} (${quixada.id})...`);
    const popRes = await fetch(`${IBGE_BASE}/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[${quixada.id}]`);
    const popData = await popRes.json();
    const series = popData?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    const lastYear = Object.keys(series || {}).sort().pop();
    console.log(`- Population (${lastYear}): ${series?.[lastYear as string]}`);

    // 4. Test Area (Agregado 8418)
    console.log(`\n4. Fetching area for ${quixada.nome}...`);
    const areaRes = await fetch(`${IBGE_BASE}/v3/agregados/8418/periodos/-1/variaveis/6318?localidades=N6[${quixada.id}]`);
    const areaData = await areaRes.json();
    const areaSeries = areaData?.[0]?.resultados?.[0]?.series?.[0]?.serie;
    const areaLastYear = Object.keys(areaSeries || {}).sort().pop();
    console.log(`- Area (${areaLastYear}): ${areaSeries?.[areaLastYear as string]} km²`);
  }
}

testIBGE().catch(console.error);
