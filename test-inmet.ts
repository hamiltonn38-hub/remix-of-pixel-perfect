async function testInmet() {
  const url = "https://apitempo.inmet.gov.br/estacao/diaria/2019-01-01/2019-12-31/A332";
  console.log("Fetching:", url);
  const res = await fetch(url);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 200));
}

testInmet().catch(console.error);
