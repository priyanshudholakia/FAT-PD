require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");

const client = axios.create({
  baseURL: process.env.ADIVAHA_BASE_URL || "https://api.adivaha.com",
  headers: {
    "PID": process.env.ADIVAHA_PID,
    "x-api-key": process.env.ADIVAHA_API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

async function run() {
  const dateStr = "2026-09-06"; // User screenshot showed Sept 6
  console.log(`Checking EXACT raw response for ${dateStr}...`);
  
  const payload = {
    action: "flightSearch",
    adults: "1",
    children: "0",
    infants: "0",
    isoneway: "Yes",
    From_IATACODE: "DEL",
    To_IATACODE: "BOM",
    departure_date: dateStr,
    return_date: "",
    flights_category: "Economy"
  };
  
  try {
    const res = await client.post("/flights/api/?action=flightSearch", payload, { responseType: 'arraybuffer' });
    console.log("STATUS CODE:", res.status);
    console.log("RAW RESPONSE DATA (buffer as string):", res.data.toString().slice(0, 500));
  } catch (err) {
    console.log("AXIOS ERROR:", err.message);
    if(err.response) {
      console.log("RESPONSE BODY:", err.response.data.toString().slice(0, 500));
    }
  }
}
run();

