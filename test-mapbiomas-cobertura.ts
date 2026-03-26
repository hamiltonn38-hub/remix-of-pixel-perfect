async function testMapBiomasAPI() {
  const url = "https://plataforma.brasil.mapbiomas.org/api/graphql";
  
  const query = `
    query {
      __schema {
        queryType {
          fields {
            name
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    console.log("Status:", res.status);
    if(res.status === 200) {
      const data = await res.json();
      console.log(JSON.stringify(data).slice(0, 300));
    } else {
      console.log(await res.text().then(t => t.slice(0, 200)));
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testMapBiomasAPI();
