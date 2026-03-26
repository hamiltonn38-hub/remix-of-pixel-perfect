async function testInmet() {
  const url = "https://apitempo.inmet.gov.br/estacao/2024-05-01/2024-05-05/A001";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  if (res.status === 200) {
    const json = await res.json();
    console.log("Response length:", json.length);
    if (json.length > 0) {
      console.log("First item:", JSON.stringify(json[0]).substring(0, 200));
    }
  } else {
    console.log(await res.text());
  }
}

testInmet().catch(console.error);
