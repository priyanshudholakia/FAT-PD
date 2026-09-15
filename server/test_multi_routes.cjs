/**
 * Tests multiple routes & dates to see if Adivaha is down entirely
 * or only for specific searches.
 */
const axios = require("axios");
require("dotenv").config();

const client = axios.create({
  baseURL: process.env.ADIVAHA_BASE_URL || "https://api.adivaha.io",
  headers: {
    PID: process.env.ADIVAHA_PID,
    "x-api-key": process.env.ADIVAHA_API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

const getDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const routes = [
  { from: "DEL", to: "PNQ", label: "Delhi → Pune" },
  { from: "DEL", to: "JAI", label: "Delhi → Jaipur" },
  { from: "BLR", to: "DEL", label: "Bangalore → Delhi" },
  { from: "BOM", to: "GOI", label: "Mumbai → Goa" },
  { from: "DEL", to: "CCU", label: "Delhi → Kolkata" },
  { from: "HYD", to: "BLR", label: "Hyderabad → Bangalore" },
];

const dates = [
  { offset: 1, label: "Tomorrow" },
  { offset: 3, label: "+3 days" },
  { offset: 7, label: "+7 days" },
];

(async () => {
  // Ensure token first
  console.log("Creating token...");
  try {
    const t = await client.get("/flights/api/", { params: { action: "createToken" } });
    console.log("Token:", t.data?.Token_Status || JSON.stringify(t.data));
  } catch (e) {
    console.error("Token failed:", e.message);
  }
  console.log("");

  // Test all combinations in parallel (batched to avoid flooding)
  const tests = [];
  for (const route of routes) {
    for (const date of dates) {
      tests.push({ ...route, ...date, depDate: getDate(date.offset) });
    }
  }

  console.log(`Testing ${tests.length} route/date combinations (45s timeout each)...\n`);

  const results = await Promise.allSettled(
    tests.map(async (t) => {
      const start = Date.now();
      try {
        const res = await client.post("/flights/api/?action=flightSearch", {
          action: "flightSearch",
          adults: "1",
          children: "0",
          infants: "0",
          isoneway: "Yes",
          From_IATACODE: t.from,
          To_IATACODE: t.to,
          departure_date: t.depDate,
          return_date: "",
          flights_category: "Economy",
        });
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const results = res.data?.responseData?.Response?.Results;
        const err = res.data?.responseData?.Response?.Error;
        const count = results?.[0]?.length || 0;
        return { ...t, status: "OK", count, elapsed, error: err };
      } catch (err) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const httpStatus = err.response?.status;
        const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
        return {
          ...t,
          status: isTimeout ? "TIMEOUT" : `HTTP ${httpStatus || "ERR"}`,
          count: 0,
          elapsed,
          error: isTimeout ? "Request timed out" : (err.response?.data?.substring?.(0, 80) || err.message),
        };
      }
    })
  );

  // Print results table
  console.log("=".repeat(90));
  console.log(
    "Route".padEnd(25) +
    "Date".padEnd(14) +
    "Status".padEnd(12) +
    "Flights".padEnd(10) +
    "Time(s)".padEnd(10) +
    "Notes"
  );
  console.log("-".repeat(90));

  results.forEach((r) => {
    const v = r.value;
    const errNote = v.status !== "OK"
      ? (typeof v.error === "string" ? v.error.substring(0, 30) : JSON.stringify(v.error)?.substring(0, 30))
      : (v.error?.ErrorCode ? `ErrCode=${v.error.ErrorCode}` : "");
    console.log(
      `${v.label}`.padEnd(25) +
      `${v.depDate}`.padEnd(14) +
      `${v.status}`.padEnd(12) +
      `${v.count}`.padEnd(10) +
      `${v.elapsed}s`.padEnd(10) +
      errNote
    );
  });

  console.log("=".repeat(90));

  const okCount = results.filter((r) => r.value.status === "OK" && r.value.count > 0).length;
  const timeoutCount = results.filter((r) => r.value.status === "TIMEOUT").length;
  const failCount = results.filter((r) => r.value.status !== "OK").length;
  console.log(`\nSummary: ${okCount} with flights, ${timeoutCount} timeouts, ${failCount} total failures out of ${tests.length} tests`);
})();
