async function checkDate(daysOffset) {
  let date = new Date("2026-09-03T10:00:00Z");
  date.setDate(date.getDate() + daysOffset);
  const dateStr = date.toISOString().split("T")[0];
  
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
    const flights = data?.responseData?.Response?.Results?.[0] || [];
    console.log(`+${daysOffset} days (${dateStr}): ${flights.length} flights`);
  } catch (err) {
    console.log(`+${daysOffset} days (${dateStr}): Fetch failed`);
  }
}

async function run() {
  for (let i of [0, 10, 30, 60, 90, 150, 200, 300, 330, 365, 400]) {
    await checkDate(i);
  }
}
run();
