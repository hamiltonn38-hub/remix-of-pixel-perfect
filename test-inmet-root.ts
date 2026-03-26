async function testInmet() {
  const res = await fetch("https://apitempo.inmet.gov.br/");
  console.log("Status:", res.status);
  console.log(await res.text());
}

testInmet().catch(console.error);
