async function testInmet() {
  const url = "https://apitempo.inmet.gov.br/estacao/dados/2024-01-01";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (res.status === 200) {
    const json = await res.json();
    console.log("Response length:", json.length);
    if (json.length > 0) {
      console.log("First item:", JSON.stringify(json[0]));
      const quixada = json.find((x: any) => x.DC_NOME === "QUIXADA");
      console.log("Quixada data:", quixada ? JSON.stringify(quixada) : "Not found");
    }
  } else {
    console.log(await res.text());
  }
}

testInmet().catch(console.error);
