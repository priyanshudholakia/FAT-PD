import axios from "axios";
import zlib from "zlib";

const ADIVAHA_API_KEY = process.env.ADIVAHA_API_KEY;
const ADIVAHA_PID = process.env.ADIVAHA_PID;
// Verify default to api.adivaha.io
const ADIVAHA_BASE_URL = process.env.ADIVAHA_BASE_URL || "https://api.adivaha.io";

const adivahaClient = axios.create({
  baseURL: ADIVAHA_BASE_URL,
  headers: {
    "PID": ADIVAHA_PID,
    "x-api-key": ADIVAHA_API_KEY,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Connection": "close"
  }
});

// --- Session/token management ---------------------------------------------
// Per Adivaha's "Create Token" doc: the returned token is tracked internally
// by Adivaha against our PID/x-api-key pair and must NOT be sent in
// subsequent request bodies — but a token still has to actually exist for
// the day, or Adivaha rejects requests. Tokens are valid only until
// 11:59 PM on the calendar day they were issued (not a rolling 24h window),
// so a fresh one is needed every day. This app never called createToken at
// all, which is consistent with exactly what was being seen: read-only
// endpoints (flightSearch, flightLocations, GetCalendarFare) kept working
// with no session, while every booking attempt (ticketForLcc/flightBook/
// ticketForNonLcc) failed with a generic, unhelpful error — Adivaha's docs
// specifically call out "Invalid Token" as ErrorCode 6, and a booking
// endpoint enforcing a valid session while search endpoints don't is a very
// plausible explanation for that exact split.
let tokenAuthenticatedDateKey = null; // "YYYY-MM-DD" for the day we last successfully created a token
let tokenCreationPromise = null; // de-dupes concurrent createToken calls if several requests race in

const todayKey = () => {
  // Adivaha's "valid until 11:59 PM" almost certainly means IST (UTC+5:30),
  // since it's an Indian travel API provider — using the server's local/UTC
  // date here would create a ~5.5 hour daily window (18:30-23:59 UTC) where
  // we think today's token is still valid by our clock while Adivaha has
  // already rolled over to a new day by theirs. The ErrorCode-6 auto-retry
  // in executeRequest() is a safety net either way, but computing the date
  // in IST avoids relying on that safety net every single day.
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
};

export const createTokenAPI = async () => {
  const response = await adivahaClient.get("/flights/api/", {
    params: { action: "createToken" }
  });
  return response.data;
};

const ensureAdivahaSession = async (force = false) => {
  if (!force && tokenAuthenticatedDateKey === todayKey()) return;
  if (tokenCreationPromise) return tokenCreationPromise;

  tokenCreationPromise = (async () => {
    try {
      const data = await createTokenAPI();
      const errorCode = data?.responseData?.Response?.Error?.ErrorCode ?? data?.Error?.ErrorCode;
      const failed = (errorCode && errorCode !== 0) || data?.status === "400" || data?.status === 400;
      if (!failed) {
        tokenAuthenticatedDateKey = todayKey();
        console.log(`[Adivaha] Session token created/refreshed for ${tokenAuthenticatedDateKey}`);
      } else {
        console.error("[Adivaha] createToken did not report success — check ADIVAHA_PID/ADIVAHA_API_KEY in .env:", data);
      }
    } catch (err) {
      console.error("[Adivaha] Failed to create session token — check ADIVAHA_PID/ADIVAHA_API_KEY/ADIVAHA_BASE_URL in .env:", err.response?.data || err.message);
    } finally {
      tokenCreationPromise = null;
    }
  })();

  return tokenCreationPromise;
};

// Called once at server boot (see index.js) so the very first real request
// doesn't pay the extra round-trip, and so a bad PID/API key shows up
// immediately in the startup logs instead of surfacing later as a mystery
// booking failure.
export const warmUpAdivahaSession = () => ensureAdivahaSession();

// Helper function to execute requests with retries for network-level drops.
// Also ensures a same-day session token exists before every call, and
// transparently re-authenticates + retries once if Adivaha reports
// "Invalid Token" (ErrorCode 6) mid-session (e.g. the token expired at
// midnight while the server process kept running).
const executeRequest = async (requestFn, retries = 3, delay = 1000) => {
  await ensureAdivahaSession();

  for (let i = 0; i < retries; i++) {
    try {
      const response = await requestFn();
      const errorCode = response?.data?.responseData?.Response?.Error?.ErrorCode ?? response?.data?.Error?.ErrorCode;
      if (errorCode === 6) {
        console.warn("[Adivaha] Session token invalid/expired (ErrorCode 6) — re-authenticating and retrying this request once.");
        await ensureAdivahaSession(true);
        return await requestFn();
      }
      return response;
    } catch (error) {
      const isNetworkError =
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT" ||
        error.message?.includes("ECONNRESET");

      if (isNetworkError && i < retries - 1) {
        console.warn(`Adivaha connection dropped (${error.code || error.message}). Retrying request in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};

// Adivaha almost never throws an HTTP error for a bad request — it responds
// with HTTP 200 and either an empty payload or a Response.Error object with
// a non-zero ErrorCode/ResponseStatus 0. Without logging this explicitly,
// a wrong action name, expired TraceId, or invalid ResultIndex all look
// identical from the outside ("no data"). This helper makes that visible
// in the server console so it can be diagnosed instead of guessed at.
const logIfProviderError = (label, data, requestPayload = null) => {
  const resp = data?.responseData?.Response;
  if (!resp) {
    console.warn(`[Adivaha][${label}] No responseData.Response in payload. Raw status/message:`, data?.status, data?.status_message);
    if (requestPayload) console.warn(`[Adivaha][${label}] Request Payload:`, JSON.stringify(requestPayload));
    console.warn(`[Adivaha][${label}] Full raw response:`, JSON.stringify(data));
    return;
  }
  const err = resp.Error;
  const statusIndicatesError = resp.Status !== undefined && resp.Status !== null && resp.Status !== 0 && resp.Status !== 1;
  if ((err && err.ErrorCode && err.ErrorCode !== 0) || resp.ResponseStatus === 0 || statusIndicatesError) {
    console.warn(`[Adivaha][${label}] Provider returned an error. ErrorCode=${err?.ErrorCode} ErrorMessage="${err?.ErrorMessage}" ResponseStatus=${resp.ResponseStatus} Status=${resp.Status} TraceId=${resp.TraceId}`);
    // Full raw response dump so field-level issues (missing Fare data, wrong
    // casing, etc.) can actually be diagnosed instead of guessed at.
    if (requestPayload) console.warn(`[Adivaha][${label}] Request Payload:`, JSON.stringify(requestPayload));
    console.warn(`[Adivaha][${label}] Full raw response:`, JSON.stringify(data));
  }
};

// Get Wallet Balance — GET /flights/api/?action=GetWalletBalance
// Returns { status, PID, ApiKey, wallet_currency, wallet_balance, test_wallet_balance }.
// In sandbox/test mode, Adivaha deducts from `test_wallet_balance` instead of the
// live `wallet_balance`, so this is the figure to check before letting a test
// booking go through.
export const getWalletBalanceAPI = async () => {
  try {
    const response = await executeRequest(() => adivahaClient.get("/flights/api/", {
      params: { action: "GetWalletBalance" }
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Get Wallet Balance Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch wallet balance from provider");
  }
};

export const getFlightLocationsAPI = async (term, limit = 10) => {
  try {
    const response = await executeRequest(() => adivahaClient.get("/flights/api/", {
      params: {
        action: "flightLocations",
        limit,
        term
      }
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Flight Locations Error:", error.response?.data || error.message);
    throw new Error("Failed to search flight locations");
  }
};

export const searchFlightsAPI = async (searchParams) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=flightSearch", {
      action: "flightSearch",
      ...searchParams
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Flight Search Error:", error.response?.data || error.message);
    throw new Error("Failed to search flights from provider");
  }
};

export const searchHotelsAPI = async (searchParams) => {
  try {
    const response = await executeRequest(() => adivahaClient.get("/hotels/search", { params: searchParams }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Hotel Search Error:", error);
    throw new Error("Failed to search hotels from provider");
  }
};

export const getCalendarFareAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=GetCalendarFare", {
      action: "GetCalendarFare",
      ...params
    }, { responseType: 'arraybuffer' }));
    
    // Adivaha Sandbox often returns a GZIP blob prepended with CRLF characters
    // without setting the proper Content-Encoding headers, breaking standard JSON parsers.
    const buf = response.data;
    let gzipIndex = -1;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x1F && buf[i+1] === 0x8B) {
        gzipIndex = i;
        break;
      }
    }
    
    let parsedData;
    if (gzipIndex !== -1) {
      const cleanBuf = buf.slice(gzipIndex);
      const unzipped = zlib.gunzipSync(cleanBuf);
      parsedData = JSON.parse(unzipped.toString());
    } else {
      parsedData = JSON.parse(buf.toString());
    }
    
    return parsedData;
  } catch (error) {
    console.error("Adivaha Calendar Fare Error:", error.response?.data || error.message);
    throw new Error("Failed to get calendar fares from provider");
  }
};

export const updateCalendarFareOfDayAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=UpdateCalendarFareOfDay", {
      action: "UpdateCalendarFareOfDay",
      ...params
    }, { responseType: 'arraybuffer' }));
    
    const buf = response.data;
    let gzipIndex = -1;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x1F && buf[i+1] === 0x8B) {
        gzipIndex = i;
        break;
      }
    }
    
    let parsedData;
    if (gzipIndex !== -1) {
      const cleanBuf = buf.slice(gzipIndex);
      const unzipped = zlib.gunzipSync(cleanBuf);
      parsedData = JSON.parse(unzipped.toString());
    } else {
      parsedData = JSON.parse(buf.toString());
    }
    
    return parsedData;
  } catch (error) {
    console.error("Adivaha Update Calendar Fare Of Day Error:", error.response?.data || error.message);
    throw new Error("Failed to update calendar fare of the day from provider");
  }
};

// NOTE: Adivaha's "action" values do NOT follow a predictable casing pattern
// (confirmed against the official API docs in client/Adivaha API/*.png).
// Sending the wrong action string does not throw — the provider silently
// returns an empty/near-empty Response, which is why SSR (seat/meal/baggage),
// fare quote, fare rule, and booking endpoints were failing while
// flightLocations/flightSearch/GetCalendarFare/UpdateCalendarFareOfDay worked.
export const getFareQuoteAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=fareQuote", {
      action: "fareQuote",
      ...params
    }));
    logIfProviderError("FareQuote", response.data);
    return response.data;
  } catch (error) {
    console.error("Adivaha Flight Fare Quote Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch flight fare quote from provider");
  }
};

export const getFareRulesAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=fareRule", {
      action: "fareRule",
      ...params
    }));
    logIfProviderError("FareRule", response.data);
    return response.data;
  } catch (error) {
    console.error("Adivaha Flight Fare Rules Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch flight fare rules from provider");
  }
};

// Flight SSR — provides Baggage / MealDynamic / SeatDynamic / SpecialServices.
// Fixed: action must be "flightSSR" (lowercase f), not "FlightSSR".
export const getSSRAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=flightSSR", {
      action: "flightSSR",
      ...params
    }));
    logIfProviderError("FlightSSR", response.data);
    return response.data;
  } catch (error) {
    console.error("Adivaha Flight SSR Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch flight SSR options from provider");
  }
};

export const bookLCCTicketAPI = async (bookingData) => {
  try {
    // Log a summary of the outgoing payload (not full PII) so a malformed
    // Fare object — the most likely cause of a generic provider rejection —
    // is visible without digging through logs. `Fare` should never be
    // null/undefined here; if it is, the caller didn't get it from a real
    // FareQuote result.
    console.log(`[Adivaha][LCC Ticket] Requesting booking. TraceId=${bookingData?.TraceId} ResultIndex=${bookingData?.ResultIndex} IsLCC=${bookingData?.IsLCC} Passengers=${bookingData?.Passengers?.length} Fare present per passenger=${bookingData?.Passengers?.map(p => !!p.Fare).join(",")}`);
    const requestPayload = {
      action: "ticketForLcc",
      ...bookingData
    };
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=ticketForLcc", requestPayload));
    logIfProviderError("LCC Ticket", response.data, requestPayload);
    // As per Adivaha recommendation, log full request and response for booking for easier debugging
    console.log(`[Adivaha][LCC Ticket] Full Request JSON:`, JSON.stringify(requestPayload));
    console.log(`[Adivaha][LCC Ticket] Full Response JSON:`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Adivaha LCC Flight Ticket Error:", error.response?.data || error.message);
    throw new Error("Failed to process LCC flight ticket booking");
  }
};

export const bookNonLCCAPI = async (bookingData) => {
  try {
    console.log(`[Adivaha][Non-LCC Book] Requesting hold. TraceId=${bookingData?.TraceId} ResultIndex=${bookingData?.ResultIndex} IsLCC=${bookingData?.IsLCC} Passengers=${bookingData?.Passengers?.length} Fare present per passenger=${bookingData?.Passengers?.map(p => !!p.Fare).join(",")}`);
    const requestPayload = {
      action: "flightBook",
      ...bookingData
    };
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=flightBook", requestPayload));
    logIfProviderError("Non-LCC Book", response.data, requestPayload);
    // As per Adivaha recommendation, log full request and response for booking for easier debugging
    console.log(`[Adivaha][Non-LCC Book] Full Request JSON:`, JSON.stringify(requestPayload));
    console.log(`[Adivaha][Non-LCC Book] Full Response JSON:`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Adivaha Non LCC Flight Book Error:", error.response?.data || error.message);
    throw new Error("Failed to process Non-LCC hold booking");
  }
};

export const issueNonLCCTicketAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=ticketForNonLcc", {
      action: "ticketForNonLcc",
      ...params
    }));
    logIfProviderError("Non-LCC Ticket Issue", response.data);
    return response.data;
  } catch (error) {
    console.error("Adivaha Non LCC Ticket Issue Error:", error.response?.data || error.message);
    throw new Error("Failed to issue Non-LCC flight ticket");
  }
};

export const releaseHoldBookingAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=ReleasePNRRequest", {
      action: "ReleasePNRRequest",
      ...params
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Release Hold Booking Error:", error.response?.data || error.message);
    throw new Error("Failed to release or cancel hold booking");
  }
};

export const getBookingDetailsAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=getBookingDetails", {
      action: "getBookingDetails",
      ...params
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Get Booking Details Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch booking details from provider");
  }
};

export const getCancellationChargesAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=getCancellationCharges", {
      action: "getCancellationCharges",
      ...params
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Cancellation Charges Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch cancellation charges from provider");
  }
};

export const cancelBookingAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=ticketCancel", {
      action: "ticketCancel",
      ...params
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Cancel Booking Error:", error.response?.data || error.message);
    throw new Error("Failed to submit cancellation request to provider");
  }
};

export const getCancellationStatusAPI = async (params) => {
  try {
    const response = await executeRequest(() => adivahaClient.post("/flights/api/?action=checkChangeStatus", {
      action: "checkChangeStatus",
      ...params
    }));
    return response.data;
  } catch (error) {
    console.error("Adivaha Cancellation Status Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch cancellation status from provider");
  }
};