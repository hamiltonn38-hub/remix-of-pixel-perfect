async function testInmet() {
  const url = "https://apitempo.inmet.gov.br/estacao/2024-01-01/2024-01-31/A314";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (res.status === 200) {
    const json = await res.json();
    console.log("Response length:", json.length);
    if (json.length > 0) {
      console.log("First item:", JSON.stringify(json[0]));
    }
  } else {
    console.log(await res.text());
  }
}

testInmet().catch(console.error);
