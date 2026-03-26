async function testAna() {
  const url = "https://www.snirh.gov.br/hidroweb/rest/api/documento/gerarTelemetricas";
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log(await res.text().then(t => t.slice(0, 300)));
  } catch(e) {
    console.log(e);
  }
}

testAna();
