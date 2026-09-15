require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");
const zlib = require("zlib");

const adivahaClient = axios.create({
  baseURL: process.env.ADIVAHA_BASE_URL || "https://api.adivaha.com",
  headers: {
    "PID": process.env.ADIVAHA_PID,
    "x-api-key": process.env.ADIVAHA_API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

async function run() {
  const dateStr = "2026-09-05"; // Use a future date!
  await adivahaClient.get("/flights/api/?action=createToken");
  
  try {
    const res = await adivahaClient.post("/flights/api/?action=GetCalendarFare", {
      action: "GetCalendarFare",
      From_IATACODE: "DEL",
      To_IATACODE: "BOM",
      departure_date: dateStr,
      flights_category: "1" // Economy
    }, {
      responseType: 'arraybuffer'
    });
    
    const buf = res.data;
    let gzipIndex = -1;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x1F && buf[i+1] === 0x8B) {
        gzipIndex = i;
        break;
      }
    }
    
    let data;
    if (gzipIndex !== -1) {
      const cleanBuf = buf.slice(gzipIndex);
      const unzipped = zlib.gunzipSync(cleanBuf);
      data = JSON.parse(unzipped.toString());
    } else {
      data = JSON.parse(buf.toString());
    }
    
    console.log("FULL PARSED DATA:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}
run();
