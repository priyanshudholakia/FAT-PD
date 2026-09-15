/**
 * Raw diagnostic: hits Adivaha API directly with minimal code.
 * Zero app logic involved — just axios + their credentials.
 */
const axios = require("axios");
require("dotenv").config();

const PID = process.env.ADIVAHA_PID;
const API_KEY = process.env.ADIVAHA_API_KEY;
const BASE = process.env.ADIVAHA_BASE_URL || "https://api.adivaha.io";

console.log("=== Adivaha Raw Diagnostic ===");
console.log(`PID: ${PID}`);
console.log(`API_KEY: ${API_KEY}`);
console.log(`BASE_URL: ${BASE}`);
console.log("");

const client = axios.create({
  baseURL: BASE,
  headers: {
    PID,
    "x-api-key": API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

(async () => {
  // Step 1: Create token
  console.log("--- Step 1: createToken ---");
  try {
    const tokenRes = await client.get("/flights/api/", {
      params: { action: "createToken" },
    });
    console.log("Status:", tokenRes.status);
    console.log("Response:", JSON.stringify(tokenRes.data, null, 2));
  } catch (err) {
    console.error("createToken FAILED:", err.response?.status, err.response?.data || err.message);
  }

  console.log("");

  // Step 2: Flight search (DEL -> PNQ, tomorrow)
  console.log("--- Step 2: flightSearch (DEL -> PNQ) ---");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const depDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  console.log("Departure date:", depDate);

  const searchBody = {
    action: "flightSearch",
    adults: "1",
    children: "0",
    infants: "0",
    isoneway: "Yes",
    From_IATACODE: "DEL",
    To_IATACODE: "PNQ",
    departure_date: depDate,
    return_date: "",
    flights_category: "Economy",
  };
  console.log("Request body:", JSON.stringify(searchBody, null, 2));

  try {
    const searchRes = await client.post("/flights/api/?action=flightSearch", searchBody);
    console.log("Status:", searchRes.status);
    const data = searchRes.data;
    
    // Check if we got valid response
    const results = data?.responseData?.Response?.Results;
    const traceId = data?.responseData?.Response?.TraceId;
    const error = data?.responseData?.Response?.Error;
    
    console.log("TraceId:", traceId);
    console.log("Error:", JSON.stringify(error));
    console.log("Results present:", !!results);
    if (results) {
      console.log("Results[0] count:", results[0]?.length || 0);
    }
    
    // Print first 500 chars of raw response for inspection
    const raw = JSON.stringify(data);
    console.log("Raw response (first 500 chars):", raw.substring(0, 500));
  } catch (err) {
    console.error("flightSearch FAILED:");
    console.error("  HTTP Status:", err.response?.status);
    console.error("  Response type:", typeof err.response?.data);
    if (typeof err.response?.data === "string") {
      console.error("  Response (first 500 chars):", err.response.data.substring(0, 500));
    } else {
      console.error("  Response:", err.response?.data || err.message);
    }
  }
})();
