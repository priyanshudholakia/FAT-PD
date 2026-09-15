require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");

const API_KEY = process.env.ADIVAHA_API_KEY;
const PID = process.env.ADIVAHA_PID;
const BASE_URL = process.env.ADIVAHA_BASE_URL || "https://api.adivaha.com";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "PID": PID,
    "x-api-key": API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

async function checkInventory() {
  const from = "DEL"; // Try DEL to BOM
  const to = "BOM";
  
  // Start from Sept 1, 2026
  let currentDate = new Date("2026-09-01T10:00:00Z");
  
  console.log(`Checking inventory for ${from} -> ${to} starting from ${currentDate.toISOString().split("T")[0]}`);
  
  let validDaysCount = 0;
  
  for (let i = 0; i < 30; i++) { // Check exactly 30 days
    const dateStr = currentDate.toISOString().split("T")[0];
    
    const payload = {
      action: "flightSearch",
      AdultCount: "1",
      ChildCount: "0",
      InfantCount: "0",
      JourneyType: "1",
      PreferredAirlines: [""],
      Segments: [
        {
          Origin: from,
          Destination: to,
          FlightCabinClass: "1",
          PreferredDepartureTime: dateStr,
          PreferredArrivalTime: dateStr
        }
      ]
    };

    try {
      const res = await client.post("/flights/api/", payload);
      const flights = res.data?.responseData?.Response?.Results?.[0] || [];
      
      if (flights.length > 0) {
        console.log(`[${dateStr}] - Success: ${flights.length} flights found.`);
        validDaysCount++;
      } else {
        console.log(`[${dateStr}] - 0 flights.`);
      }
    } catch (err) {
      console.log(`[${dateStr}] - Error hitting API (Rate limit?)`);
    }

    currentDate.setDate(currentDate.getDate() + 1);
    await new Promise(r => setTimeout(r, 600)); // 600ms delay to avoid rate limit
  }
  
  console.log(`\nTotal days with active flights in Sandbox for ${from}-${to}: ${validDaysCount}`);
}

checkInventory();
