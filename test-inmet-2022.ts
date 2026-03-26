async function testInmet() {
  const url = "https://apitempo.inmet.gov.br/estacao/2022-01-01/2022-01-05/A314";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (res.status === 200) {
    const json = await res.json();
    console.log("Response length:", json.length);
    if (json.length > 0) {
      console.log("First item CHUVA:", json[0].CHUVA);
      console.log("Sample:", JSON.stringify(json[0]));
    }
  } else {
    console.log(await res.text());
  }
}

testInmet().catch(console.error);
