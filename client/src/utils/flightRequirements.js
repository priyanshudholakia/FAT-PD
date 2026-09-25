/**
 * ============================================================================
 * PATH: client/src/utils/flightRequirements.js
 * DESCRIPTION: Dynamic Flight Booking Requirements Engine.
 *
 * WHY THIS EXISTS
 * ----------------
 * A static "domestic vs international -> passport yes/no" passenger form is
 * wrong for two reasons Adivaha's own data proves:
 *   1. A single itinerary can mix domestic and international SEGMENTS (a
 *      connecting itinerary via a foreign hub, or a multi-city trip), so the
 *      requirement must be derived per-segment and OR'd across the whole
 *      itinerary, not guessed from the first/last airport pair.
 *   2. Adivaha tells us explicitly, per option, whether passport/PAN/GST are
 *      required — sometimes required even for a domestic-looking fare
 *      (confirmed: PassportNo has been rejected as empty on a pure DEL-BOM
 *      LCC fare in real testing). Those explicit flags must always win over
 *      any domestic/international guess.
 *
 * This module is the single source of truth for "what do we need from the
 * passenger, and what must be true about this itinerary, before we're
 * allowed to open the payment gateway / call ticketForLcc / flightBook /
 * ticketForNonLcc." It is deliberately duplicated (not imported) between
 * server/src/services/flightRequirements.js and client/src/utils/
 * flightRequirements.js so the client can render a dynamic form immediately
 * from search-time data, while the server re-runs the exact same logic
 * against freshly revalidated data as the final, authoritative gate before
 * money moves or a ticket is issued. Keep the two files in sync.
 *
 * INPUT SHAPE
 * -----------
 * computeFlightRequirements() accepts one Adivaha "option" object (a single
 * entry from Results[][], or the Response.Results object FareQuote returns),
 * OR an array of such option objects (round-trip = [outboundOption,
 * inboundOption], multi-city = one per leg). Every option carries top-level
 * flags (IsPassportRequiredAtBook, GSTAllowed, ...) plus a `Segments` array
 * of arrays (each inner array is one leg's stops). This function flattens
 * every segment across every option/leg and evaluates requirements against
 * the complete itinerary, not just the first segment.
 * ============================================================================
 */

// FlightStatus / Status values that indicate the segment is NOT a hard
// confirmed booking and should block/flag the itinerary rather than be
// silently treated as fine.
const UNCONFIRMED_STATUS_KEYWORDS = ["waitlist", "ws", "unconfirmed", "notoffered", "soldout", "closed", "na"];

// Below this many remaining seats we surface a low-availability warning
// (not a hard block unless NoOfSeatAvailable is actually 0).
const LOW_SEAT_WARNING_THRESHOLD = 4;

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const cleanText = (s) => (typeof s === "string" ? s.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim() : "");

const dedupe = (arr) => Array.from(new Set(arr.filter(Boolean)));

// Adivaha's LastTicketDate is formatted like "19Aug26" (dMMMyy). Returns a
// Date or null if unparseable — used to find the EARLIEST (tightest)
// deadline across every option in the itinerary, since booking has to
// respect whichever leg expires first.
const parseLastTicketDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const cleaned = cleanText(str);
  const match = cleaned.match(/^(\d{1,2})([A-Za-z]{3})(\d{2,4})$/);
  if (!match) {
    const asDate = new Date(cleaned);
    return isNaN(asDate.getTime()) ? null : asDate;
  }
  const [, day, monStr, yearStr] = match;
  const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const month = months[monStr.toLowerCase()];
  if (month === undefined) return null;
  let year = parseInt(yearStr, 10);
  if (year < 100) year += 2000;
  const d = new Date(year, month, parseInt(day, 10), 23, 59, 59);
  return isNaN(d.getTime()) ? null : d;
};

// Flattens every segment out of every leg of every option into one flat list
// carrying the fields we need to inspect (Origin/Destination country codes,
// Airline info, per-segment status/eligibility flags).
const flattenSegments = (options) => {
  const segments = [];
  for (const opt of options) {
    const legs = toArray(opt?.Segments);
    for (const leg of legs) {
      for (const seg of toArray(leg)) {
        segments.push({
          optionResultIndex: opt?.ResultIndex,
          optionSource: opt?.Source,
          originCountry: seg?.Origin?.Airport?.CountryCode || seg?.Origin?.Airport?.CountryName || null,
          destCountry: seg?.Destination?.Airport?.CountryCode || seg?.Destination?.Airport?.CountryName || null,
          originAirport: seg?.Origin?.Airport?.AirportCode,
          destAirport: seg?.Destination?.Airport?.AirportCode,
          airlineCode: seg?.Airline?.AirlineCode,
          flightNumber: seg?.Airline?.FlightNumber,
          fareClass: seg?.Airline?.FareClass,
          operatingCarrier: seg?.Airline?.OperatingCarrier || seg?.Airline?.AirlineCode,
          supplierFareClass: seg?.SupplierFareClass || opt?.SupplierFareClass,
          isETicketEligible: seg?.IsETicketEligible,
          flightStatus: seg?.FlightStatus || seg?.Status,
          craft: seg?.Craft,
          stopOver: !!seg?.StopOver,
          originDepTime: seg?.Origin?.DepTime || null
        });
      }
    }
  }
  return segments;
};

// True if a segment's origin/destination countries differ. When country
// codes/names are missing on a segment we can't infer anything from it, so
// it's excluded from the domestic/international vote rather than guessed.
const isInternationalSegment = (seg) => {
  const origin = seg.originCountry ? String(seg.originCountry).trim().toUpperCase() : null;
  const dest = seg.destCountry ? String(seg.destCountry).trim().toUpperCase() : null;
  if (origin && dest && origin !== dest) return true;
  if (origin && origin !== "IN" && origin !== "INDIA") return true;
  if (dest && dest !== "IN" && dest !== "INDIA") return true;
  if (origin && dest && origin === dest) return false;
  return null; // unknown
};

// Booleans across the whole itinerary: "ANY option/segment requires this" ->
// true (a single connecting leg needing a passport makes the whole
// itinerary need one, regardless of what the other legs say).
const orFlag = (options, key) => options.some((o) => o?.[key] === true);

// "explicit" if at least one option actually carries this key (even as
// false) — used to know whether we should trust the flags over a
// segment-based fallback guess.
const hasExplicitFlag = (options, key) => options.some((o) => o?.[key] !== undefined && o?.[key] !== null);

// Safety flags (bookable-if-seat-not-available, e-ticket eligibility) use
// AND semantics: the itinerary is only as permissive/eligible as its
// weakest leg.
const andFlagAcrossSegments = (segments, key) => {
  const withValue = segments.filter((s) => s[key] !== undefined && s[key] !== null);
  if (withValue.length === 0) return null;
  return withValue.every((s) => s[key] === true);
};

/**
 * Scans free-text AirlineRemark / TicketAdvisory strings for language that
 * indicates a coupon/promo code is actually MANDATORY (not just usable).
 * This is deliberately a soft, low-confidence signal — IsCouponAppilcable
 * alone must never be read as "mandatory". Real confirmation should come
 * from revalidation (FareQuote/SSR re-fetch) or an explicit provider flag
 * such as IsPromoCodeRequired if/when Adivaha returns one.
 */
const scanForMandatoryCouponLanguage = (texts) => {
  const couponWord = /(coupon|promo\s*code|promotional\s*code)/i;
  const mandatoryWord = /(mandatory|required|must\s+(be\s+)?(enter|provide|apply)|cannot\s+be\s+booked\s+without)/i;
  return texts.some((t) => couponWord.test(t) && mandatoryWord.test(t));
};

/**
 * Main entry point. Pass either a single Adivaha option object or an array
 * of them (round-trip / multi-city — one per confirmed leg). Returns a
 * structured requirements object; never throws on missing/malformed data —
 * everything degrades to a safe default (require the field) rather than
 * silently skipping a real requirement.
 */
export const computeFlightRequirements = (rawOptions) => {
  const options = toArray(rawOptions).filter(Boolean);

  if (options.length === 0) {
    return {
      valid: false,
      blockers: ["No fare/itinerary data was available to evaluate booking requirements."],
      warnings: [],
      itinerary: null,
      perPassengerType: {},
      meta: { hasInternationalSegment: null, segmentCount: 0 }
    };
  }

  const segments = flattenSegments(options);
  const isDomesticExplicitFalse = options.some((o) => o?.IsDomestic === false || o?.IsDomestic === 0 || o?.IsDomestic === "false");
  const internationalVotes = segments.map(isInternationalSegment).filter((v) => v !== null);
  const hasInternationalSegment = isDomesticExplicitFalse || (internationalVotes.length > 0 && internationalVotes.some(Boolean));
  const isInternational = !!hasInternationalSegment;

  // --- Travel date (earliest outbound departure across every leg) --------
  // Used to validate each passenger's declared PaxType (Adult/Child/Infant)
  // against IATA age bands as of the actual day of travel — not "today" —
  // since a passenger who is 11 now may be 12 by departure, and vice versa.
  const depTimes = segments.map((s) => s.originDepTime).filter(Boolean).map((t) => new Date(t)).filter((d) => !isNaN(d.getTime()));
  const earliestTravelDate = depTimes.length ? new Date(Math.min(...depTimes.map((d) => d.getTime()))) : null;

  // --- Passport -------------------------------------------------------
  const passportAtBookExplicit = hasExplicitFlag(options, "IsPassportRequiredAtBook");
  const passportAtTicketExplicit = hasExplicitFlag(options, "IsPassportRequiredAtTicket");
  const passportRequiredAtBook = orFlag(options, "IsPassportRequiredAtBook");
  const passportRequiredAtTicket = orFlag(options, "IsPassportRequiredAtTicket");
  const passportFullDetailRequiredExplicit = orFlag(options, "IsPassportFullDetailRequiredAtBook");

  // Rule: International flights strictly mandate passport details for all travellers.
  // In addition, if explicit provider flags require passport, it is required.
  const passportFlagsExplicit = passportAtBookExplicit || passportAtTicketExplicit;
  const passportRequired = isInternational || (passportFlagsExplicit
    ? (passportRequiredAtBook || passportRequiredAtTicket)
    : false);
  const passportFullDetailRequired = isInternational || passportFullDetailRequiredExplicit;

  // --- PAN --------------------------------------------------------------
  const panRequiredAtBook = orFlag(options, "IsPanRequiredAtBook");
  const panRequiredAtTicket = orFlag(options, "IsPanRequiredAtTicket");
  const panRequired = panRequiredAtBook || panRequiredAtTicket;

  // --- GST ----------------------------------------------------------------
  const gstAllowed = orFlag(options, "GSTAllowed");
  const gstMandatory = orFlag(options, "IsGSTMandatory");

  // --- Hold / SSR -----------------------------------------------------
  const holdAllowedWithSSR = orFlag(options, "IsHoldAllowedWithSSR");
  const holdMandatoryWithSSR = orFlag(options, "IsHoldMandatoryWithSSR");

  // --- Seat availability -------------------------------------------------
  const bookableIfSeatNotAvailable = andFlagAcrossSegments(
    options.map((o) => ({ IsBookableIfSeatNotAvailable: o?.IsBookableIfSeatNotAvailable })),
    "IsBookableIfSeatNotAvailable"
  );
  const seatCounts = options.map((o) => o?.NoOfSeatAvailable).filter((n) => n !== undefined && n !== null && !isNaN(Number(n))).map(Number);
  const minSeatsAvailable = seatCounts.length ? Math.min(...seatCounts) : null;

  // --- E-ticket eligibility / flight status ------------------------------
  const eTicketEligible = andFlagAcrossSegments(segments, "isETicketEligible");
  const unconfirmedSegments = segments.filter((s) => {
    const status = (s.flightStatus || "").toString().toLowerCase().trim();
    return status && UNCONFIRMED_STATUS_KEYWORDS.some((kw) => status.includes(kw));
  });

  // --- Ticketing deadline --------------------------------------------
  const lastTicketDates = options.map((o) => parseLastTicketDate(o?.LastTicketDate)).filter(Boolean);
  const earliestLastTicketDate = lastTicketDates.length
    ? new Date(Math.min(...lastTicketDates.map((d) => d.getTime())))
    : null;

  // --- Advisory / remark text (supplier instructions, not decoration) ----
  const airlineRemarks = dedupe(options.map((o) => cleanText(o?.AirlineRemark)));
  const ticketAdvisories = dedupe(options.map((o) => cleanText(o?.TicketAdvisory)));

  // --- Coupon -------------------------------------------------------------
  const couponApplicable = orFlag(options, "IsCouponAppilcable");
  const explicitCouponMandatoryFlag = orFlag(options, "IsPromoCodeRequired") || orFlag(options, "IsCouponMandatory");
  const couponMandatoryFromRemarks = scanForMandatoryCouponLanguage([...airlineRemarks, ...ticketAdvisories]);
  const couponMandatory = explicitCouponMandatoryFlag || couponMandatoryFromRemarks;
  const couponConfidence = explicitCouponMandatoryFlag ? "explicit" : couponMandatoryFromRemarks ? "inferred" : "none";

  // --- Fare rules / carriers / classes (pass-through, deduped) -----------
  const fareRules = [];
  for (const o of options) {
    for (const rule of toArray(o?.FareRules)) {
      if (rule && !fareRules.some((r) => r.FareBasisCode === rule.FareBasisCode && r.Origin === rule.Origin && r.Destination === rule.Destination)) {
        fareRules.push(rule);
      }
    }
  }
  const validatingAirlines = dedupe(options.map((o) => o?.ValidatingAirline));
  const operatingCarriers = dedupe(segments.map((s) => s.operatingCarrier));
  const supplierFareClasses = dedupe(segments.map((s) => s.supplierFareClass));
  const fareClasses = dedupe(segments.map((s) => s.fareClass));
  const resultIndexes = dedupe(options.map((o) => o?.ResultIndex));
  const sources = dedupe(options.map((o) => o?.Source));
  const requiredFieldValidators = dedupe(options.flatMap((o) => toArray(o?.RequiredFieldValidators).map(cleanText)));
  const nameFormatGuidance = dedupe([...options.map((o) => cleanText(o?.FirstNameFormat)), ...options.map((o) => cleanText(o?.LastNameFormat))]);

  // --- Warnings / blockers ------------------------------------------------
  const warnings = [];
  const blockers = [];

  if (resultIndexes.length === 0 || resultIndexes.some((r) => !r)) {
    blockers.push("Missing ResultIndex for one or more segments — this itinerary cannot be booked. Please search again.");
  }

  if (minSeatsAvailable !== null) {
    if (minSeatsAvailable <= 0 && bookableIfSeatNotAvailable !== true) {
      blockers.push("No seats reported available on this fare and the fare is not bookable on request. Please choose a different flight.");
    } else if (minSeatsAvailable > 0 && minSeatsAvailable <= LOW_SEAT_WARNING_THRESHOLD) {
      warnings.push(`Only ${minSeatsAvailable} seat(s) reported available — availability may change before payment completes. We revalidate right before checkout.`);
    }
  }

  if (unconfirmedSegments.length > 0) {
    warnings.push(
      `${unconfirmedSegments.length} segment(s) report a non-confirmed status (${dedupe(unconfirmedSegments.map((s) => s.flightStatus)).join(", ")}). Revalidate before paying.`
    );
  }

  if (eTicketEligible === false) {
    warnings.push("One or more segments are not e-ticket eligible. Ticket delivery may require manual processing.");
  }

  if (holdMandatoryWithSSR) {
    warnings.push("This fare requires baggage/meal/seat (SSR) selections to be completed before the booking can be held.");
  }

  if (earliestLastTicketDate) {
    const hoursLeft = (earliestLastTicketDate.getTime() - Date.now()) / 36e5;
    if (hoursLeft <= 0) {
      blockers.push("The ticketing deadline for this fare has already passed. Please search again for a fresh fare.");
    } else if (hoursLeft <= 24) {
      warnings.push(`This fare must be ticketed before ${earliestLastTicketDate.toISOString()} (less than 24 hours) or the fare will be released.`);
    }
  }

  for (const remark of airlineRemarks) warnings.push(`Airline remark: ${remark}`);
  for (const advisory of ticketAdvisories) warnings.push(`Ticket advisory: ${advisory}`);

  for (const validator of requiredFieldValidators) warnings.push(`Provider-required field: ${validator}`);

  if (isInternational) warnings.push("International flight: Valid passport details are mandatory for all travellers.");
  if (gstMandatory) warnings.push("GST details are mandatory for this fare/booking.");
  if (couponMandatory) warnings.push(`A coupon/promo code appears to be required for this fare (${couponConfidence === "explicit" ? "confirmed by provider flag" : "inferred from airline remarks — will be re-confirmed on revalidation"}).`);

  const itinerary = {
    isInternational,
    passport: {
      required: passportRequired,
      requiredAtBook: passportRequiredAtBook || isInternational,
      requiredAtTicket: passportRequiredAtTicket || isInternational,
      fullDetailRequired: passportFullDetailRequired,
      source: isInternational ? "international_route" : (passportFlagsExplicit ? "api_flag" : (hasInternationalSegment === null ? "unknown" : "inferred_from_segments"))
    },
    pan: {
      required: panRequired,
      requiredAtBook: panRequiredAtBook,
      requiredAtTicket: panRequiredAtTicket
    },
    gst: {
      allowed: gstAllowed,
      mandatory: gstMandatory
    },
    coupon: {
      applicable: couponApplicable,
      mandatory: couponMandatory,
      confidence: couponConfidence
    },
    hold: {
      allowedWithSSR: holdAllowedWithSSR,
      mandatoryWithSSR: holdMandatoryWithSSR
    },
    seatAvailability: {
      bookableIfSeatNotAvailable,
      minSeatsAvailable
    },
    eTicketEligible,
    lastTicketDate: earliestLastTicketDate ? earliestLastTicketDate.toISOString() : null,
    ticketAdvisories,
    airlineRemarks,
    fareRules,
    validatingAirlines,
    operatingCarriers,
    supplierFareClasses,
    fareClasses,
    resultIndexes,
    sources,
    requiredFieldValidators,
    nameFormatGuidance,
    travelDate: earliestTravelDate ? earliestTravelDate.toISOString() : null
  };

  // Adivaha's flags are itinerary/fare-level, not per-passenger-type — no
  // observed field distinguishes adult vs child vs infant requirements, so
  // the same computed requirement applies to every PaxType. Infants are
  // NOT auto-exempted from passport/PAN just because they're infants: if
  // the itinerary/fare says passport is required, every passenger
  // (including infants) must supply one, since that's what the airline/GDS
  // will actually validate against at ticketing.
  const perPassengerType = {
    1: { passportRequired, panRequired, passportFullDetailRequired },
    2: { passportRequired, panRequired, passportFullDetailRequired },
    3: { passportRequired, panRequired, passportFullDetailRequired }
  };

  return {
    valid: blockers.length === 0,
    blockers,
    warnings,
    itinerary,
    perPassengerType,
    meta: {
      hasInternationalSegment,
      segmentCount: segments.length,
      optionCount: options.length
    }
  };
};

/**
 * Validates a collected Passengers[] array (+ contact + optional GST/coupon
 * fields) against a computed requirements object. Returns { valid,
 * missingFields[] } where each missingFields entry is a human-readable,
 * actionable message — used both by the server as the final pre-payment /
 * pre-ticketing gate, and can be reused client-side for inline validation.
 *
 * `extra` may include: { gstin, gstCompanyName, couponCode, contact }
 */
export const validatePassengersAgainstRequirements = (requirements, passengers, extra = {}) => {
  const missingFields = [];
  if (!requirements || !requirements.itinerary) {
    return { valid: false, missingFields: ["Booking requirements could not be determined for this fare."] };
  }

  if (!requirements.valid) {
    missingFields.push(...requirements.blockers);
  }

  const paxList = Array.isArray(passengers) ? passengers : [];
  if (paxList.length === 0) {
    missingFields.push("At least one passenger is required.");
  }

  paxList.forEach((p, idx) => {
    const label = `Passenger ${idx + 1} (${p?.FirstName || p?.firstName || "unnamed"})`;
    const paxType = p?.PaxType || p?.paxType || 1;
    const req = requirements.perPassengerType[paxType] || requirements.perPassengerType[1];

    if (!(p?.FirstName || p?.firstName)) missingFields.push(`${label}: first name is required.`);
    if (!(p?.LastName || p?.lastName)) missingFields.push(`${label}: last name is required.`);

    const dobRaw = p?.DateOfBirth || p?.dob;
    if (!dobRaw) {
      missingFields.push(`${label}: date of birth is required.`);
    } else {
      // Standard IATA age bands, checked as of the actual travel date (not
      // "today") — Adult 12+, Child 2 to <12, Infant <2. This is exactly
      // the "adult age should be more than a certain age" rejection users
      // hit at Adivaha's ticketing step when a passenger's declared PaxType
      // doesn't match what their DOB implies for the day they actually fly.
      const dob = new Date(dobRaw);
      const asOf = requirements.itinerary.travelDate ? new Date(requirements.itinerary.travelDate) : new Date();
      if (isNaN(dob.getTime())) {
        missingFields.push(`${label}: date of birth is invalid.`);
      } else if (dob.getTime() > asOf.getTime()) {
        missingFields.push(`${label}: date of birth cannot be after the travel date.`);
      } else {
        let ageAtTravel = asOf.getFullYear() - dob.getFullYear();
        const monthDiff = asOf.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dob.getDate())) ageAtTravel--;

        if (paxType === 3 && ageAtTravel >= 2) {
          missingFields.push(`${label}: booked as an Infant but will be ${ageAtTravel} year(s) old on the day of travel (must be under 2).`);
        } else if (paxType === 2 && (ageAtTravel < 2 || ageAtTravel >= 12)) {
          missingFields.push(`${label}: booked as a Child but will be ${ageAtTravel} year(s) old on the day of travel (must be 2–11).`);
        } else if (paxType === 1 && ageAtTravel < 12) {
          missingFields.push(`${label}: booked as an Adult but will only be ${ageAtTravel} year(s) old on the day of travel (must be 12 or older — book as Child/Infant instead).`);
        }
      }
    }

    if (req.passportRequired) {
      const passportNo = p?.PassportNo || p?.passportNo;
      const passportExpiry = p?.PassportExpiry || p?.passportExpiry;
      if (!passportNo) missingFields.push(`${label}: passport number is required for this itinerary.`);
      if (!passportExpiry) missingFields.push(`${label}: passport expiry date is required for this itinerary.`);
      else {
        const expiryDate = new Date(passportExpiry);
        if (!isNaN(expiryDate.getTime()) && expiryDate.getTime() < Date.now()) {
          missingFields.push(`${label}: passport has expired.`);
        }
      }
      if (req.passportFullDetailRequired) {
        const issuePlace = p?.PassportIssuePlace || p?.passportIssuePlace;
        const issueDate = p?.PassportIssueDate || p?.passportIssueDate;
        const nationality = p?.Nationality || p?.nationality || extra?.sharedDetails?.nationality || extra?.nationality || p?.CountryCode;
        if (!issuePlace) missingFields.push(`${label}: passport place of issue is required for this fare.`);
        if (!issueDate) missingFields.push(`${label}: passport issue date is required for this fare.`);
        if (!nationality) missingFields.push(`${label}: nationality is required for this fare.`);
      }
    }

    if (req.panRequired) {
      const pan = p?.PAN || p?.pan;
      if (!pan) {
        missingFields.push(`${label}: PAN is required for this booking.`);
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan)) {
        missingFields.push(`${label}: PAN format looks invalid (expected e.g. ABCDE1234F).`);
      }
    }
  });

  if (requirements.itinerary.gst.mandatory) {
    if (!extra.gstin) missingFields.push("GSTIN is mandatory for this fare/booking.");
    if (!extra.gstCompanyName) missingFields.push("GST registered company name is mandatory for this fare/booking.");
  }

  if (requirements.itinerary.coupon.mandatory && !extra.couponCode) {
    missingFields.push("A coupon/promo code appears to be required for this fare but none was provided.");
  }

  const contact = extra.contact || {};
  if (!contact.mobile) missingFields.push("Contact mobile number is required.");
  if (!contact.email) missingFields.push("Contact email is required.");

  return { valid: missingFields.length === 0, missingFields };
};

export default { computeFlightRequirements, validatePassengersAgainstRequirements, parseLastTicketDate };
