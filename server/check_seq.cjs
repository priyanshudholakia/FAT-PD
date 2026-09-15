async function checkServer() {
  const dateStr = "2026-09-04"; // Use a known working date (Sep 4)
  console.log(`Checking Adivaha Server Status for DEL to BOM on ${dateStr}...`);
  try {
    const res = await fetch("http://localhost:5000/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From_IATACODE: "DEL",
        To_IATACODE: "BOM",
        departure_date: dateStr,
        adults: "1",
        children: "0",
        infants: "0",
        flights_category: "Economy",
        isoneway: "Yes"
      })
    });
    const data = await res.json();
    const status = res.status;
    
    console.log("HTTP STATUS:", status);
    if (!data.success && data.message) {
      console.log("INTERNAL ERROR:", data.message);
    }
    
    if (data?.responseData?.Response) {
      const resp = data.responseData.Response;
      console.log("ADIVAHA ERROR CODE:", resp.Error?.ErrorCode || 0);
      console.log("ADIVAHA ERROR MESSAGE:", resp.Error?.ErrorMessage || "None");
      const flights = resp.Results?.[0] || [];
      console.log("FLIGHTS RETURNED:", flights.length);
    } else {
      console.log("No Adivaha response object found in data:", data);
    }
  } catch (err) {
    console.log("FETCH FAILED CATASTROPHICALLY:", err.message);
  }
}

checkServer();
