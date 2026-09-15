/**
 * ============================================================================
 * PATH: client/src/common/PaymentPage.jsx
 * DESCRIPTION: Global Payment Gateway Page matching the Figma design system.
 *              Includes interactive coupons, payment tabs, dynamic fare calculations,
 *              and a secure simulated payment gateway.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Check,
  User,
  MapPin,
  Star,
  CreditCard,
  Lock,
  ShieldCheck,
  Building2,
  Wallet,
  Smartphone,
  Loader2,
  Tag,
  ArrowRight,
  AlertCircle,
  ChevronDown
} from "lucide-react";

import Header from "./Header";
import Footer from "./Footer";
import BookingSummary from "../pages/flights/booking/components/BookingSummary";
import FareSummary from "../pages/flights/booking/components/FareSummary";
import { getFareBreakdownByType, buildPerPassengerFare } from "../utils/fareBreakdown";
import { computeFlightRequirements } from "../utils/flightRequirements";

// Vector QR Code Component for pixel-perfect, clean rendering without remote assets
const QRCodeSVG = () => (
  <svg className="w-full h-full p-1" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Finder Pattern: Top Left */}
    <rect x="5" y="5" width="25" height="25" rx="2" fill="black" />
    <rect x="10" y="10" width="15" height="15" rx="1" fill="white" />
    <rect x="14" y="14" width="7" height="7" rx="0.5" fill="black" />

    {/* Finder Pattern: Top Right */}
    <rect x="70" y="5" width="25" height="25" rx="2" fill="black" />
    <rect x="75" y="10" width="15" height="15" rx="1" fill="white" />
    <rect x="79" y="14" width="7" height="7" rx="0.5" fill="black" />

    {/* Finder Pattern: Bottom Left */}
    <rect x="5" y="70" width="25" height="25" rx="2" fill="black" />
    <rect x="10" y="75" width="15" height="15" rx="1" fill="white" />
    <rect x="14" y="79" width="7" height="7" rx="0.5" fill="black" />

    {/* Small Alignment Pattern: Bottom Right */}
    <rect x="75" y="75" width="9" height="9" rx="1" fill="black" />
    <rect x="77" y="77" width="5" height="5" rx="0.5" fill="white" />
    <rect x="79" y="79" width="1" height="1" fill="black" />

    {/* Random QR Code Data blocks */}
    <rect x="35" y="5" width="5" height="5" fill="black" />
    <rect x="45" y="5" width="10" height="5" fill="black" />
    <rect x="60" y="5" width="5" height="10" fill="black" />
    <rect x="35" y="15" width="15" height="5" fill="black" />
    <rect x="55" y="15" width="5" height="5" fill="black" />

    <rect x="5" y="35" width="5" height="15" fill="black" />
    <rect x="15" y="45" width="10" height="5" fill="black" />
    <rect x="20" y="35" width="5" height="5" fill="black" />

    <rect x="35" y="30" width="10" height="10" fill="black" />
    <rect x="50" y="35" width="5" height="5" fill="black" />
    <rect x="60" y="30" width="15" height="5" fill="black" />
    <rect x="80" y="35" width="15" height="10" fill="black" />
    <rect x="70" y="40" width="5" height="15" fill="black" />

    <rect x="35" y="45" width="5" height="10" fill="black" />
    <rect x="45" y="50" width="15" height="5" fill="black" />

    <rect x="5" y="55" width="15" height="5" fill="black" />
    <rect x="25" y="55" width="5" height="10" fill="black" />

    <rect x="35" y="60" width="10" height="5" fill="black" />
    <rect x="50" y="60" width="5" height="15" fill="black" />
    <rect x="60" y="60" width="5" height="5" fill="black" />
    <rect x="70" y="60" width="10" height="10" fill="black" />

    <rect x="35" y="75" width="5" height="15" fill="black" />
    <rect x="45" y="70" width="15" height="5" fill="black" />
    <rect x="45" y="80" width="5" height="10" fill="black" />
    <rect x="55" y="85" width="15" height="5" fill="black" />
    <rect x="65" y="75" width="5" height="5" fill="black" />
  </svg>
);

export default function PaymentPage() {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // Fallback flight configuration matching Figma exactly
  const defaultFlight = {
    airline: "IndiGo",
    code: "6E-204",
    logo: "https://images.kiwi.com/airlines/64/6E.png",
    depTime: "06:00",
    arrTime: "08:10",
    duration: "2h 10m",
    stops: "Non-stop",
    route: "DEL → PNQ",
    date: "15 Dec 2026",
    class: "Economy",
    basePrice: 3499,
    taxes: 420
  };

  // Retrieve parameters passed from a booking page or use defaults
  const bookingType = location.state?.bookingType || "flight";
  const rawFlight = location.state?.flight || defaultFlight;
  const basePrice = location.state?.basePrice || rawFlight.basePrice || 3499;
  const taxes = location.state?.taxes || rawFlight.taxes || 420;

  // Full Adult/Child/Infant breakdown for the Price Summary panel — reuse
  // whatever BookingPage already computed (passed via location.state) when
  // available, otherwise derive it fresh from the confirmed rawOption so a
  // direct/refreshed landing on this page still shows real numbers.
  const fareBreakdown = getFareBreakdownByType(rawFlight?.rawOption);
  // See BookingPage.jsx: includes each row's reconciled `totalLeftover`
  // share so the breakdown rows always sum to the Grand Total.
  const taxesBreakdownTotal = location.state?.taxesBreakdownTotal
    ?? (fareBreakdown ? Math.round(fareBreakdown.reduce((sum, row) => sum + row.totalTax + row.totalLeftover, 0)) : taxes);

  const flight = {
    ...defaultFlight,
    ...rawFlight,
    // BookingPage never sets a `route` string (it carries fromCode/toCode
    // instead) so this always fell through to the hardcoded "DEL → PNQ"
    // default regardless of the actual itinerary — build it from the real
    // origin/destination codes first.
    route: rawFlight.route
      || (rawFlight.fromCode && rawFlight.toCode ? `${rawFlight.fromCode} → ${rawFlight.toCode}` : "DEL → PNQ"),
    class: location.state?.fare?.title || rawFlight.class || "Economy"
  };

  // Form interactive states
  const [activeTab, setActiveTab] = useState("upi"); // upi, card, netbanking, wallets
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Adivaha-side promo code. Distinct from `couponInput`/`appliedCoupon`
  // above, which are FlyAnyTrip's own marketing discount codes (FIRSTFLY,
  // FLY200, HDFC15) that only affect totalAmount. This one is a booking
  // requirement the AIRLINE/provider itself imposes on certain fares
  // (Adivaha's FareQuote flags this via `IsPromoCodeRequired`) — it doesn't
  // change the price, it's just a mandatory field ticketForLcc/flightBook
  // won't accept as empty for those fares. The user supplies whatever real
  // promo code they have for that fare; Adivaha validates it on booking.
  const [airlinePromoCode, setAirlinePromoCode] = useState("");

  // Payment states
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  // Sandbox simulation tools
  const [paymentOutcome, setPaymentOutcome] = useState("success"); // success, failure
  const [isProcessing, setIsProcessing] = useState(false);

  // Requirements snapshot computed back in BookingInfo (Step 1) from the
  // FareQuote-confirmed option, used here only for display (advisories,
  // whether to show the GST-mandatory hint, etc.) — the AUTHORITATIVE check
  // that actually blocks payment is the server-side /validate-booking call
  // in handlePay below, which revalidates fare + availability + every
  // mandatory field fresh, right before the gateway opens.
  const computedRequirements = useMemo(() => computeFlightRequirements(rawFlight?.rawOption || null), [rawFlight]);
  const requirements = location.state?.requirements || computedRequirements;

  // Real traveller-type breakdown from the Passengers[] actually collected
  // in BookingInfo — replaces a fixed "1 Adult" that ignored however many
  // adults/children/infants were really on this booking.
  const summaryPassengers = location.state?.passengers || [];
  const paxTypeOf = (p) => p?.paxType || p?.PaxType || 1;
  const summaryAdultCount = summaryPassengers.filter((p) => paxTypeOf(p) === 1).length;
  const summaryChildCount = summaryPassengers.filter((p) => paxTypeOf(p) === 2).length;
  const summaryInfantCount = summaryPassengers.filter((p) => paxTypeOf(p) === 3).length;
  const paxSummaryLabel = (() => {
    const parts = [];
    if (summaryAdultCount > 0) parts.push(`${summaryAdultCount} Adult${summaryAdultCount > 1 ? "s" : ""}`);
    if (summaryChildCount > 0) parts.push(`${summaryChildCount} Child${summaryChildCount > 1 ? "ren" : ""}`);
    if (summaryInfantCount > 0) parts.push(`${summaryInfantCount} Infant${summaryInfantCount > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(" · ") : "1 Adult";
  })();

  // Real cabin class from Adivaha's numeric CabinClass code on the confirmed
  // segment (1=Unspecified/All, 2=Economy, 3=Premium Economy, 4=Business,
  // 5=Premium Business, 6=First) — replaces a fabricated "Economy Value"
  // fare-tier name that was shown whenever the (never-populated) `flight.class`
  // field was undefined, which was every real booking.
  const CABIN_CLASS_LABELS = { 1: "Economy", 2: "Economy", 3: "Premium Economy", 4: "Business", 5: "Premium Business", 6: "First" };
  const cabinClassLabel = CABIN_CLASS_LABELS[rawFlight?.rawOption?.Segments?.[0]?.[0]?.CabinClass]
    || rawFlight?.rawOption?.FareClassification?.Type
    || "Economy";

  const formatSummaryDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };


  // Pre-payment revalidation gate state
  const [isValidating, setIsValidating] = useState(false);
  const [validationBlockers, setValidationBlockers] = useState([]);

  // Live Adivaha (test) wallet balance — shown in the Developer Sandbox panel
  // so it's obvious how much of the sandbox balance a booking will consume,
  // and whether there's enough left before money actually gets "deducted".
  const [walletBalance, setWalletBalance] = useState(null); // { currency, balance, isTest }
  const [walletError, setWalletError] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  const fetchWalletBalance = async () => {
    try {
      setLoadingWallet(true);
      setWalletError("");
      const res = await axios.get(`${API_BASE_URL}/flights/wallet-balance`);
      const data = res.data || {};
      const usesTestBalance = data.test_wallet_balance !== undefined && data.test_wallet_balance !== null;
      setWalletBalance({
        currency: data.wallet_currency || "INR",
        balance: parseFloat(usesTestBalance ? data.test_wallet_balance : data.wallet_balance) || 0,
        isTest: usesTestBalance
      });
    } catch (err) {
      console.error("Error fetching wallet balance:", err.response?.data || err.message);
      setWalletError(err.response?.data?.message || "Could not fetch wallet balance.");
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic Fare Calculations
  const getDiscount = () => {
    if (appliedCoupon === "FIRSTFLY") return 500;
    if (appliedCoupon === "FLY200") return 200;
    if (appliedCoupon === "HDFC15") return Math.round(basePrice * 0.15);
    return 0;
  };

  const discount = getDiscount();

  // BookingPage already computes the correct total — pubFare (base+taxes)
  // plus the seat price plus addonsData.totalAdditional (meal/baggage/
  // insurance) — and passes it through as location.state.totalAmount.
  // This page used to throw that away and recompute basePrice + taxes only,
  // silently dropping every seat/meal/baggage selection from the amount
  // actually charged via Razorpay, from the wallet-balance check, and from
  // the financials saved to the database. Derive the addon/seat total from
  // the passed-through figure so it stays in sync with whatever the booking
  // steps calculated, and only fall back to addonsData directly if this page
  // was somehow opened without that state (e.g. a raw deep link).
  const passedTotalAmount = location.state?.totalAmount;
  const additionalAmount = passedTotalAmount != null
    ? Math.max(0, Math.round(passedTotalAmount) - basePrice - taxes)
    : (location.state?.addonsData?.totalAdditional || 0);
  const totalAmount = (passedTotalAmount != null
    ? Math.round(passedTotalAmount)
    : basePrice + taxes + additionalAmount) - discount;

  // This fare requires a real, airline-side promo code (Adivaha's FareQuote
  // flags it via IsPromoCodeRequired) — Pay is disabled until the user has
  // typed one into the field below. Unlike the earlier version of this
  // page, this does NOT block the fare outright; it just makes sure we
  // never send an empty/placeholder value for a fare that actually needs
  // one (that's what produced "PromoCode is mandatory for this Booking"
  // after payment).
  const promoCodeRequired = !!flight.rawOption?.IsPromoCodeRequired;
  const promoCodeMissing = promoCodeRequired && !airlinePromoCode.trim();

  // Coupon handling
  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (code === "FIRSTFLY" || code === "FLY200" || code === "HDFC15") {
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon "${code}" applied successfully!`);
      setCouponError("");
    } else if (code === "") {
      setCouponError("Please enter a coupon code.");
      setCouponSuccess("");
    } else {
      setCouponError("Invalid coupon code. Try FIRSTFLY, FLY200, or HDFC15.");
      setCouponSuccess("");
    }
  };

  const handleSelectCouponPill = (code) => {
    setCouponInput(code);
    setAppliedCoupon(code);
    setCouponSuccess(`Coupon "${code}" applied successfully!`);
    setCouponError("");
  };

  // Razorpay Checkout Script loader helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Builds the per-passenger Fare / Baggage / MealDynamic / SeatDynamic
  // sub-objects Adivaha's ticketForLcc / flightBook docs require inside each
  // Passengers[] entry. Only the lead passenger carries the seat/meal/baggage
  // selections made in the UI today (BookingSeat/BookingPersonalize only
  // support a single selection, not one per traveller) — extend this if you
  // add per-passenger add-on selection later.
  const COUNTRY_NAMES = { IN: "India", US: "United States", GB: "United Kingdom", AE: "United Arab Emirates", AU: "Australia", CA: "Canada", SG: "Singapore" };

  // Adivaha's LCC ticketing (ticketForLcc) rejects the booking with
  // ErrorCode 3 "Invalid Baggage" if a passenger's Baggage[] is sent empty.
  // A passenger who didn't buy extra baggage still has to be given an
  // explicit baggage selection — the airline's own included/free allowance,
  // which flightSSR always returns as the Code:"NoBaggage", Price:0 entry
  // for each segment. BookingPersonalize deliberately excludes that entry
  // from the purchasable add-on list (it's not something to "buy"), so it
  // has to be filled back in here whenever the passenger didn't pick a paid
  // upgrade. Falls back to [] only if the SSR response itself had no
  // Baggage data at all for this itinerary (nothing to default to).
  const getDefaultBaggageEntries = (ssrData) => {
    if (!Array.isArray(ssrData?.Baggage)) return [];
    const defaults = [];
    ssrData.Baggage.forEach((legBaggage) => {
      if (!Array.isArray(legBaggage) || legBaggage.length === 0) return;
      // Prefer the explicit "NoBaggage" entry Adivaha returns for the
      // airline's included allowance; fall back to the cheapest (usually
      // free) option on this leg if "NoBaggage" isn't present.
      const noBaggage = legBaggage.find((b) => b?.Code === "NoBaggage")
        || [...legBaggage].sort((a, b) => (a?.Price || 0) - (b?.Price || 0))[0];
      if (noBaggage) defaults.push(noBaggage);
    });
    return defaults;
  };

  const buildPassengersPayload = () => {
    const rawFare = flight.rawOption?.Fare || null;
    const seatObj = location.state?.selectedSeatObj || null;
    const mealObj = location.state?.addonsData?.mealObj || null;
    const baggageObjs = location.state?.addonsData?.addonObjs || [];
    const ssrData = location.state?.ssrData || null;
    const defaultBaggageEntries = getDefaultBaggageEntries(ssrData);

    const statePassengers = location.state?.passengers;
    const contact = location.state?.contact || {};
    const contactNo = (contact.mobile || "9876543210").replace(/\D/g, "") || "9876543210";
    const email = contact.email || location.state?.email || "user@flyanytrip.com";

    // Nationality/City/AddressLine1 collected once in BookingInfo's shared
    // "Address & Nationality" block and applied to every passenger — see
    // that component for why this isn't asked per-traveller.
    const shared = location.state?.sharedDetails || {};
    const countryCode = shared.nationality || "IN";

    // Fallback to a single default adult if BookingInfo data is missing
    // (e.g. someone deep-linked straight into /payment during testing).
    const sourcePassengers = Array.isArray(statePassengers) && statePassengers.length > 0
      ? statePassengers
      : [{ paxType: 1, title: "Mr", firstName: "Rahul", lastName: "Sharma", isLeadPax: true }];

    const genderForTitle = (title) => (title === "Mr" || title === "Master" ? 1 : 2);
    const genderCode = (p) => (p.gender === "Female" ? 2 : p.gender === "Male" ? 1 : genderForTitle(p.title));

    return sourcePassengers.map((p) => ({
      Title: p.title || "Mr",
      FirstName: p.firstName || "Traveler",
      LastName: p.lastName || "Passenger",
      PaxType: p.paxType || 1,
      DateOfBirth: p.dob ? `${p.dob}T00:00:00` : (p.paxType === 3 ? "2025-01-01T00:00:00" : "1995-01-01T00:00:00"),
      Gender: genderCode(p),
      // Real value collected on the passenger form — sending an empty
      // string here is what previously produced "Passport No can't be
      // empty" from Adivaha/TBO, even on a domestic fare. Falls back to an
      // empty string only for the deep-link testing fallback above, which
      // has no passport data to send in the first place.
      PassportNo: p.passportNo || "",
      PassportExpiry: p.passportExpiry ? `${p.passportExpiry}T00:00:00` : "",
      // Only populated when the requirements engine flagged
      // IsPassportFullDetailRequiredAtBook for this itinerary — BookingInfo
      // only collects these fields (and therefore only sends them) in that
      // case, so an empty string here is expected/correct for most fares.
      PassportIssuePlace: p.passportIssuePlace || "",
      PassportIssueDate: p.passportIssueDate ? `${p.passportIssueDate}T00:00:00` : "",
      // PAN — only ever populated when IsPanRequiredAtBook/AtTicket is true
      // for this itinerary (see BookingInfo's dynamic PAN field).
      PAN: p.pan || "",
      AddressLine1: shared.addressLine1 || "123 Main St",
      AddressLine2: "",
      City: shared.city || "Delhi",
      CountryCode: countryCode,
      CountryName: COUNTRY_NAMES[countryCode] || "India",
      Nationality: countryCode,
      ContactNo: contactNo,
      Email: email,
      IsLeadPax: !!p.isLeadPax,
      // Fare object Adivaha requires per-passenger. This MUST be the fare
      // for this ONE passenger, not the aggregate total across every
      // adult/child/infant on the booking — Adivaha's FareBreakdown array
      // gives the exact base+tax total charged for each PassengerType, so
      // buildPerPassengerFare() divides that type's total by its count to
      // get the true single-passenger amount. Sending the same aggregate
      // Fare object (e.g. the 2-adult+1-child+1-infant total) on every
      // Passengers[] entry — as this previously did — overstates the fare
      // by a multiple of the passenger count and is exactly the kind of
      // mismatch Adivaha's gateway rejects with a generic error on
      // multi-passenger bookings, even though it happens to "work" for a
      // single adult (where per-passenger and aggregate are the same
      // number). Falls back to the aggregate Fare object only if the
      // option has no FareBreakdown to derive a per-unit figure from.
      Fare: buildPerPassengerFare(flight.rawOption, p.paxType || 1) || rawFare,
      // Every passenger needs a real Baggage selection, not just the lead
      // pax: the purchased add-on (currently only collected once, applied
      // to the lead pax) if bought, otherwise the airline's own free/
      // included allowance from SSR — never an empty array, which is what
      // Adivaha rejects as ErrorCode 3 "Invalid Baggage".
      Baggage: p.isLeadPax && baggageObjs.length > 0 ? baggageObjs : defaultBaggageEntries,
      MealDynamic: p.isLeadPax && mealObj ? [mealObj] : [],
      SeatDynamic: p.isLeadPax && seatObj ? [seatObj] : []
    }));
  };

  const processBookingAfterPayment = async (paymentId) => {
    try {
      setIsProcessing(true);
      const traceId = flight.rawOption?.TraceId || location.state?.traceId;
      const resultIndex = flight.rawOption?.ResultIndex || location.state?.resultIndex;
      const isLCC = flight.rawOption?.IsLCC !== false;
      const isDomesticFlight = flight.rawOption?.IsDomestic !== false; // Adivaha flag when present, default true (INR routes)

      const userEmail = location.state?.contact?.email || location.state?.email || "user@flyanytrip.com";

      const bookingPayload = {
        ResultIndex: resultIndex,
        TraceId: traceId,
        // Adivaha's docs (LCC/Non-LCC Book curl samples) send IsLCC as the
        // *string* "0"/"1", not a JSON boolean — sending `true`/`false` here
        // previously didn't match what the provider expects.
        IsLCC: isLCC ? "1" : "0",
        isoneway: "Yes",
        isDomestic: isDomesticFlight ? "Yes" : "No",
        IsDomesticReturn: "No",
        // A non-empty placeholder for the common case where Adivaha doesn't
        // actually require one. For fares that DO require one
        // (IsPromoCodeRequired, checked above as `promoCodeRequired`), the
        // real code the user typed into the Promo Code field on this page
        // is sent instead — Adivaha validates it against a real coupon on
        // its side; testing confirmed a placeholder like "NA" gets rejected
        // with "PromoCode is mandatory for this Booking" for those fares,
        // because the field is actually checked against a real value, not
        // just non-empty.
        PromoCode: promoCodeRequired
          ? airlinePromoCode.trim()
          : (flight.rawOption?.PromoCode || location.state?.promoCode || "NA"),
        Passengers: buildPassengersPayload(),
        // Only sent when GSTAllowed is true for this fare AND the traveller
        // actually filled the (optional-unless-mandatory) GST card in
        // BookingInfo — see requirements.itinerary.gst.
        ...(location.state?.sharedDetails?.gstin ? {
          GSTNumber: location.state.sharedDetails.gstin,
          GSTCompanyName: location.state.sharedDetails.gstCompanyName || "",
          GSTDetails: {
            GSTNumber: location.state.sharedDetails.gstin,
            RegisteredName: location.state.sharedDetails.gstCompanyName || ""
          }
        } : {})
      };

      const meta = {
        traceId,
        paymentId: paymentId || "pay_" + Math.random().toString(36).substring(2, 10),
        userEmail,
        passengers: bookingPayload.Passengers,
        flightInfo: {
          airlineName: flight.airline,
          airlineCode: flight.code?.split("-")[0] || "6E",
          flightNumber: flight.code?.split("-")[1] || "204",
          origin: flight.fromCode || flight.route?.split("→")[0]?.trim() || "DEL",
          destination: flight.toCode || flight.route?.split("→")[1]?.trim() || "PNQ",
          departureTime: flight.rawOption?.Segments?.[0]?.[0]?.Origin?.DepTime,
          arrivalTime: flight.rawOption?.Segments?.[0]?.[0]?.Destination?.ArrTime,
          cabinClass: flight.class || "Economy"
        },
        financials: {
          basePrice,
          taxes,
          totalAmount
        },
        addons: location.state?.addonsData || null
      };

      let finalPNR = "";
      let finalBookingId = "";
      let apiBookingData = null;

      const endpoint = isLCC ? `${API_BASE_URL}/flights/book-lcc` : `${API_BASE_URL}/flights/book-non-lcc`;

      let bookingRes = null;
      let bookingFailureMessage = null;
      try {
        bookingRes = await axios.post(endpoint, { bookingPayload, meta });
      } catch (err) {
        console.warn("Flight Booking API notice:", err.response?.data || err.message);
        // Surface an insufficient-balance rejection (HTTP 402 from our own
        // server-side wallet guard) distinctly, since that's a very common
        // reason a sandbox booking fails and is otherwise indistinguishable
        // from a generic provider error. Any other HTTP error from our own
        // server (e.g. 502 when the provider reported success but gave no
        // usable PNR/BookingId) also carries a `message` worth surfacing.
        bookingFailureMessage = err.response?.data?.message
          || err.response?.data?.status_message
          || err.message;
      }

      // IMPORTANT: a failed/errored request (bookingRes === null) must go
      // straight to the failure page here. Previously this fell through to
      // the PNR-extraction logic below, which — finding nothing on a null
      // response — fabricated a fake PNR ("FLY" + random) and BookingId
      // ("BK" + Date.now()) and sent the user to the "Flight Booked!" page
      // as if a real ticket existed, even though the request never
      // succeeded (e.g. the 502 case just fixed server-side, or any network
      // failure). That is the single worst outcome this app can produce —
      // a customer being shown a confirmation for a ticket that doesn't
      // exist after they've already paid.
      if (!bookingRes) {
        routerNavigate("/booking-failure", {
          state: {
            ...location.state,
            paymentSucceeded: true,
            errorMessage: bookingFailureMessage || "Payment was received but we couldn't confirm your ticket. Our team will follow up shortly."
          }
        });
        return;
      }

      // Adivaha nests the actual booking payload (PNR/BookingId/
      // FlightItinerary/etc.) one level deeper than the envelope carrying
      // Error/ResponseStatus/TraceId/order_id — confirmed against a live
      // ticketForLcc response: responseData.Response.{Error, ResponseStatus,
      // TraceId, order_id, Response: {PNR, BookingId, ...}}. Reading PNR
      // straight off responseData.Response (one level too shallow) is why
      // genuinely successful bookings were being reported as "no PNR
      // returned." Falls back to the outer object if there's no nested
      // Response, in case another endpoint returns it flat instead.
      const outerResp = bookingRes?.data?.responseData?.Response || bookingRes?.data?.responseData || null;
      const innerResp = (outerResp?.Response && typeof outerResp.Response === "object") ? outerResp.Response : outerResp;
      apiBookingData = outerResp;

      // Check if Adivaha returned a provider error (e.g. Status: 7605 "Sorry fare is not available. Please try with new fare")
      const rawStatus = bookingRes?.data?.Status || outerResp?.Status || outerResp?.Error?.ErrorCode;
      // Prefer the SPECIFIC reason (Error.ErrorMessage — e.g. "PromoCode is
      // mandatory for this Booking.") over the generic top-level
      // status_message ("Failed"), which used to win here purely because it
      // happened to come first in this `||` chain. That meant the customer
      // (and support, reading the same string later) only ever saw "Failed"
      // instead of the actual, actionable reason the booking was rejected.
      const statusMsg = outerResp?.Error?.ErrorMessage || bookingRes?.data?.status_message || outerResp?.status_message;

      if (rawStatus === 7605 || (rawStatus && rawStatus !== 0 && rawStatus !== 1)) {
        console.warn("[Booking API Error]", { rawStatus, statusMsg });
        routerNavigate("/booking-failure", {
          state: {
            ...location.state,
            paymentSucceeded: true,
            errorMessage: statusMsg || "Sorry, this flight fare is no longer available. Please search again for updated fares."
          }
        });
        return;
      }

      finalPNR = bookingRes?.data?.pnr || innerResp?.PNR || innerResp?.B2B2CPNR || "";
      finalBookingId = bookingRes?.data?.bookingId || innerResp?.BookingId || "";

      if (!finalPNR || !finalBookingId) {
        // Never fabricate a PNR/BookingId. If the provider genuinely didn't
        // return one, there is no real ticket — showing "Flight Booked!"
        // anyway would be actively lying to a paying customer.
        console.error("[Booking] Provider response had no usable PNR/BookingId at either nesting level — refusing to show a fake success page. Raw response:", bookingRes?.data);
        routerNavigate("/booking-failure", {
          state: {
            ...location.state,
            paymentSucceeded: true,
            errorMessage: "Payment was received but the airline didn't confirm a booking reference. Our team will follow up shortly — please contact support with your transaction ID."
          }
        });
        return;
      }

      if (!isLCC) {
        // Step 2 for Non-LCC: Ticket Issue.
        // Per Adivaha's "Non LCC Ticket Issue" doc, this endpoint needs the
        // same PNR/BookingId/TraceId/IsLCC/isoneway/isDomestic/
        // IsDomesticReturn/Passengers[] (with Fare/Baggage/MealDynamic/
        // SeatDynamic) that were sent to Book, plus an `order_id` returned
        // by the Book step — sending only PNR/BookingId/TraceId (as before)
        // dropped every one of those required fields, so the ticket would
        // either fail to issue or issue without the passenger's actual
        // fare/seat/meal/baggage selections.
        const orderId = outerResp?.order_id
          || outerResp?.OrderId
          || innerResp?.order_id
          || "";

        let issueRes = null;
        let issueFailureMessage = null;
        try {
          issueRes = await axios.post(`${API_BASE_URL}/flights/issue-ticket`, {
            PNR: finalPNR,
            BookingId: finalBookingId,
            order_id: orderId,
            TraceId: traceId,
            // Required by the server-side final requirements gate
            // (runFinalRequirementsGate) to re-fetch a fresh FareQuote and
            // re-check AtTicket-only requirements (IsPassportRequiredAtTicket
            // / IsPanRequiredAtTicket) before issuance — without this the
            // gate has nothing to revalidate against and every non-LCC
            // ticket issuance would be blocked.
            ResultIndex: resultIndex,
            IsLCC: "0",
            isoneway: bookingPayload.isoneway,
            isDomestic: bookingPayload.isDomestic,
            IsDomesticReturn: bookingPayload.IsDomesticReturn,
            PromoCode: bookingPayload.PromoCode,
            Passengers: bookingPayload.Passengers
          });
        } catch (err) {
          console.warn("Non-LCC Ticket Issue API notice:", err.response?.data || err.message);
          issueFailureMessage = err.response?.data?.message || err.response?.data?.status_message || err.message;
        }

        // A Non-LCC booking only becomes a real ticket once issuance
        // succeeds. If it didn't, the customer has a HOLD and a completed
        // payment but no ticket — that must go to the failure page, not a
        // fabricated success screen (the exact bug that was happening
        // before, just one step later in the Non-LCC flow).
        if (!issueRes) {
          routerNavigate("/booking-failure", {
            state: {
              ...location.state,
              paymentSucceeded: true,
              errorMessage: issueFailureMessage || "Your seat was held and payment received, but ticket issuance failed. Our team will follow up shortly."
            }
          });
          return;
        }

        const issueOuter = issueRes?.data?.responseData?.Response || issueRes?.data?.responseData || null;
        const issueInner = (issueOuter?.Response && typeof issueOuter.Response === "object") ? issueOuter.Response : issueOuter;
        const issueRawStatus = issueRes?.data?.Status || issueOuter?.Status || issueOuter?.Error?.ErrorCode;
        // Same precedence fix as the LCC branch above — the specific
        // provider reason should win over the generic "Failed" string.
        const issueStatusMsg = issueOuter?.Error?.ErrorMessage || issueRes?.data?.status_message || issueOuter?.status_message;

        if (issueRawStatus === 7605 || (issueRawStatus && issueRawStatus !== 0 && issueRawStatus !== 1)) {
          console.warn("[Ticket Issue API Error]", { issueRawStatus, issueStatusMsg });
          routerNavigate("/booking-failure", {
            state: {
              ...location.state,
              paymentSucceeded: true,
              errorMessage: issueStatusMsg || "Ticket issuance failed. Our team will follow up shortly."
            }
          });
          return;
        }

        if (issueInner) {
          apiBookingData = issueInner;
          // Ticket issuance can return a refreshed/confirmed PNR — prefer it.
          finalPNR = issueInner.PNR || finalPNR;
        }
      }

      routerNavigate("/flights/booking-success", {
        state: {
          ...location.state,
          // Override with this page's final figures — location.state still
          // carries the pre-discount totalAmount computed back in
          // BookingPage, so without this override the success page would
          // show a total that ignores any coupon applied here.
          basePrice,
          taxes,
          totalAmount,
          pnr: finalPNR,
          bookingId: finalBookingId,
          paymentId: meta.paymentId,
          apiBookingResponse: apiBookingData,
          isLCC
        }
      });
    } catch (err) {
      console.error("Error calling flight booking API:", err);
      // Payment already succeeded at this point, so we must not silently
      // pretend the booking succeeded too — send the user to the failure
      // page with the real reason (e.g. insufficient wallet balance) so
      // support/ops can follow up on the charged-but-not-ticketed payment.
      routerNavigate("/booking-failure", {
        state: {
          ...location.state,
          paymentSucceeded: true,
          errorMessage: err.message || "Payment was received but we couldn't confirm your ticket. Our team will follow up shortly."
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePay = async () => {
    if (promoCodeMissing) {
      // Don't attempt Razorpay — the inline field below already shows why.
      return;
    }

    // --------------------------------------------------------------------
    // AUTHORITATIVE PRE-GATEWAY GATE.
    // "Before opening the payment gateway, revalidate the selected
    // ResultIndex, confirm the latest fare and availability, ... and block
    // payment if any mandatory requirement is missing." This is that step:
    // it re-fetches a fresh FareQuote server-side (never trusts what this
    // page already has in memory, since fare/availability/requirements can
    // all have changed since Step 1), recomputes requirements with the same
    // dynamic engine BookingInfo used, and validates everything the
    // traveller entered against it. Razorpay is not opened unless this
    // comes back valid.
    // --------------------------------------------------------------------
    setValidationBlockers([]);
    setIsValidating(true);
    try {
      const traceId = flight.rawOption?.TraceId || location.state?.traceId;
      const resultIndex = flight.rawOption?.ResultIndex || location.state?.resultIndex;

      const { data } = await axios.post(`${API_BASE_URL}/flights/validate-booking`, {
        TraceId: traceId,
        ResultIndex: resultIndex,
        passengers: location.state?.passengers || [],
        contact: location.state?.contact || {},
        gstin: location.state?.sharedDetails?.gstin || undefined,
        gstCompanyName: location.state?.sharedDetails?.gstCompanyName || undefined,
        couponCode: promoCodeRequired ? airlinePromoCode.trim() : (location.state?.promoCode || undefined)
      });

      if (!data?.valid) {
        setValidationBlockers(data?.missingFields?.length ? data.missingFields : ["This fare could not be revalidated. Please go back and try again."]);
        setIsValidating(false);
        return;
      }
    } catch (err) {
      console.error("[validate-booking] Pre-payment revalidation failed:", err.response?.data || err.message);
      setValidationBlockers([
        err.response?.data?.missingFields?.length
          ? err.response.data.missingFields.join(" ")
          : "We couldn't revalidate this fare with the airline right now. Please try again in a moment."
      ]);
      setIsValidating(false);
      return;
    }
    setIsValidating(false);

    // Attempt Razorpay Standard Gateway Checkout
    const isLoaded = await loadRazorpayScript();
    if (isLoaded && window.Razorpay) {
      try {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: "INR",
          name: "FlyAnyTrip",
          description: `Flight Booking: ${flight.airline} (${flight.route})`,
          image: flight.logo || "https://images.kiwi.com/airlines/64/6E.png",
          handler: async function (response) {
            await processBookingAfterPayment(response.razorpay_payment_id);
          },
          prefill: {
            name: "Rahul Sharma",
            email: location.state?.email || "user@flyanytrip.com",
            contact: "9876543210"
          },
          theme: {
            color: "#FF2D1A"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay Checkout notice, processing standard payment flow:", err);
      }
    }

    // Fallback payment execution if Razorpay popup is blocked or offline
    if (paymentOutcome === "success") {
      await processBookingAfterPayment();
    } else {
      routerNavigate("/booking-failure", { state: location.state });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans">

      {/* 1. Global Header Wrapper */}
      <Header />

      {/* 2. Main Page Content */}
      <main className="max-w-[1393px] mx-auto px-4 py-7 w-full flex-grow flex flex-col gap-6 font-quicksand">



        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_395px] gap-7 items-start">

          {/* Left Column: Full Booking Review Details & Direct Razorpay CTA */}
          <div className="w-full flex flex-col gap-6 text-left font-inter">

            {/* Itinerary-level advisories carried over from BookingInfo's
                requirements snapshot (AirlineRemark / TicketAdvisory / low
                seat count / ticketing deadline) — shown again here so
                they're visible right before paying, not just on Step 1. */}
            {requirements?.warnings?.length > 0 && (
              <div className="space-y-2">
                {requirements.warnings.slice(0, 3).map((w, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-semibold text-amber-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Review Details Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
              <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-5 flex items-center space-x-2 font-inter select-none">
                <ShieldCheck className="w-[18px] h-[18px] text-[#10B981] flex-shrink-0" />
                <span>Booking Summary</span>
              </h3>

              <div className="space-y-5 text-sm font-bold text-[#1A1A1A] font-inter">
                {/* Flight — route/date computed from the real confirmed
                    segment data (flight.route/flight.date were never
                    actually set anywhere upstream, so this previously
                    rendered blank on every real booking). */}
                <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
                  <span className="text-[#6B6B6B] font-bold text-[14px]">Flight</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[#1A1A1A] font-bold text-[14px]">
                      {flight.airline} {flight.code} · {flight.fromCode} → {flight.toCode} · {formatSummaryDate(flight.rawOption?.Segments?.[0]?.[0]?.Origin?.DepTime)}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                      {flight.depTime} – {flight.arrTime} · {flight.stops} · {flight.duration}
                    </span>
                  </div>
                </div>

                {/* Passenger — real traveller count (from the Passengers[]
                    collected in BookingInfo, not a fixed "1 Adult") and the
                    real cabin class off the confirmed segment
                    (flight.class was never populated anywhere, so this
                    previously always fell through to a fabricated "Economy
                    Value" fare-tier name that doesn't correspond to
                    anything Adivaha returned). */}
                <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
                  <span className="text-[#6B6B6B] font-bold text-[14px]">Passenger</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[#1A1A1A] font-bold text-[14px]">
                      {paxSummaryLabel} · {cabinClassLabel}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                      Seat: {location.state?.selectedSeat || "System assigned (free)"}
                    </span>
                  </div>
                </div>

                {/* Meal */}
                <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
                  <span className="text-[#6B6B6B] font-bold text-[14px]">Meal</span>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[#1A1A1A] font-bold text-[14px]">
                      {location.state?.addonsData?.meal && location.state.addonsData.meal !== "none" ? location.state.addonsData.meal : "No Preference"}
                    </span>
                    <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                      {location.state?.addonsData?.meal && location.state.addonsData.meal !== "none" ? "Pre-ordered" : "No extra charge"}
                    </span>
                  </div>
                </div>

                {/* Add-ons (baggage etc.) — previously the selections made in
                    step 3 (BookingPersonalize) were only reflected in the
                    aggregate "+₹X" fare line and never listed here, so there
                    was no way to see *what* was booked before paying. */}
                {Array.isArray(location.state?.addonsData?.addonObjs) && location.state.addonsData.addonObjs.length > 0 && (
                  <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
                    <span className="text-[#6B6B6B] font-bold text-[14px]">Add-ons</span>
                    <div className="text-right flex flex-col items-end gap-1">
                      {location.state.addonsData.addonObjs.map((bag, idx) => (
                        <span key={bag.Code || idx} className="text-[13px] text-[#1A1A1A] font-bold">
                          {(bag.Text ? bag.Text.replace(/\n/g, " ") : `Extra Baggage ${bag.Weight || ""} KG`)}
                          {bag.Price ? ` (+₹${Number(bag.Price).toLocaleString()})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {location.state?.selectedSeat && (
                  <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
                    <span className="text-[#6B6B6B] font-bold text-[14px]">Seat</span>
                    <span className="text-[#1A1A1A] font-bold text-[14px]">{location.state.selectedSeat}</span>
                  </div>
                )}

                {/* Dynamic price summary box */}
                <div className="bg-[#FCECEC] rounded-xl p-[15px] flex items-center justify-between mt-5 font-inter">
                  <div className="grid grid-cols-[max-content_auto] gap-y-1 gap-x-2.5 text-[12px] text-[#555555] font-semibold items-center select-none">
                    <span>Base:</span>
                    <span className="font-bold">₹{basePrice.toLocaleString()}</span>

                    <span>Taxes:</span>
                    <span className="font-bold">₹{taxes.toLocaleString()}</span>
                  </div>

                  <div className="text-right flex flex-col items-end justify-center">
                    <span className="text-[11.25px] text-[#1A1A1A] font-semibold">Total Payable</span>
                    <span className="text-[22.5px] font-bold text-[#1A1A1A] mt-0.5 leading-none">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Airline-required Promo Code — only shown when Adivaha's
                    FareQuote flagged this exact fare as IsPromoCodeRequired.
                    Not a discount field: this fare simply cannot be ticketed
                    without a real code here, whatever value it is. */}
                {promoCodeRequired && (
                  <div className="mt-4">
                    <label htmlFor="airlinePromoCode" className="text-[13px] font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Tag className="w-[14px] h-[14px] text-[#FF2D1A]" />
                      Promo Code (required for this fare)
                    </label>
                    <input
                      id="airlinePromoCode"
                      type="text"
                      value={airlinePromoCode}
                      onChange={(e) => setAirlinePromoCode(e.target.value)}
                      placeholder="Enter the promo code for this fare"
                      className="mt-2 w-full h-[42px] px-3.5 rounded-lg border border-[#EAEAEA] text-[14px] font-semibold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF2D1A]/30 focus:border-[#FF2D1A]"
                    />
                    <p className="text-[11px] text-[#6B6B6B] font-medium mt-1.5">
                      This fare is only bookable with a valid promo code — enter it above to enable payment.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Direct Razorpay Pay CTA Button block */}
            <div className="space-y-3.5">
              <button
                type="button"
                disabled={isProcessing || isValidating || promoCodeMissing || (walletBalance && walletBalance.balance < totalAmount)}
                onClick={handlePay}
                className="w-full py-4 bg-[#FF2D1A] hover:bg-red-700 text-white font-bold text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 select-none active:scale-[0.99] font-quicksand cursor-pointer disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Revalidating fare & availability...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Razorpay Ticket Issuance...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalAmount.toLocaleString()} with Razorpay</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Secured by Razorpay • 256-Bit SSL Encrypted Payment Gateway</span>
              </div>

              {promoCodeMissing && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Enter the promo code above to enable payment for this fare.</span>
                </div>
              )}

              {/* Result of the /validate-booking pre-gateway gate — payment
                  was blocked because a mandatory field is still missing or
                  the fare/availability changed since Step 1. */}
              {validationBlockers.length > 0 && (
                <div className="space-y-1.5 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Payment blocked — this needs to be fixed first:</span>
                  </div>
                  <ul className="text-[11px] font-semibold text-rose-600 list-disc pl-6 space-y-0.5">
                    {validationBlockers.slice(0, 6).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {walletBalance && walletBalance.balance < totalAmount && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Adivaha {walletBalance.isTest ? "test " : ""}wallet balance is too low to complete this booking. Top up the wallet in the Adivaha dashboard before paying.</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Booking Summary & Fare Summary sidebar */}
          <aside className="w-full flex flex-col gap-6 text-left">
            <BookingSummary flight={flight} />
            <FareSummary
              breakdown={fareBreakdown}
              taxesTotal={taxesBreakdownTotal}
              basePrice={basePrice}
              taxes={taxes}
              additionalAmount={additionalAmount}
              totalAmount={totalAmount}
              discount={discount}
              promoCode={appliedCoupon}
            />

            {/* SSL PCI-DSS Trust Signal Panel */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4.5 flex items-start gap-3 text-xs font-semibold text-[#15803D] select-none font-sans leading-relaxed shadow-3xs">
              <ShieldCheck className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
              <span>PCI DSS Level 1 Certified · 256-bit SSL secure bank payments · Zero extra processing charges applied.</span>
            </div>

          </aside>

        </div>

        {/* 3. Developer Sandbox Control Panel (Expander) */}
        <div className="mt-8 border border-dashed border-gray-300 rounded-2xl p-5 bg-white max-w-2xl mx-auto w-full select-none shadow-xs text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
              <h4 className="font-bold text-sm text-gray-800">Developer Sandbox Control Panel</h4>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-gray-100 px-2 py-0.5 rounded text-gray-500">Testing Mode</span>
          </div>

          <p className="text-xs text-gray-500 font-semibold mb-4 leading-normal">
            Use this panel to customize the payment outcome simulated in this testing workspace. You can choose whether a payment triggers success or failure before clicking &ldquo;Pay Securely&rdquo;.
          </p>

          {/* Live Adivaha Test Wallet Balance — this is the balance the provider
              actually deducts from when a sandbox booking is ticketed. */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Adivaha {walletBalance?.isTest ? "Test" : ""} Wallet Balance
                </p>
                {loadingWallet ? (
                  <p className="text-xs text-gray-400 font-semibold">Fetching balance…</p>
                ) : walletError ? (
                  <p className="text-xs text-rose-600 font-semibold">{walletError}</p>
                ) : (
                  <p className="text-sm font-extrabold text-gray-800">
                    {walletBalance?.currency || "INR"} {walletBalance?.balance?.toLocaleString() ?? "—"}
                    {walletBalance && walletBalance.balance < totalAmount && (
                      <span className="ml-2 text-[11px] font-bold text-rose-600">Insufficient for this booking (₹{totalAmount.toLocaleString()})</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchWalletBalance}
              disabled={loadingWallet}
              className="text-[11px] font-bold text-gray-600 border border-gray-300 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPaymentOutcome("success")}
              className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentOutcome === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-3xs"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentOutcome === "success" ? "border-emerald-600" : "border-gray-300"
                }`}>
                {paymentOutcome === "success" && <div className="w-2 h-2 bg-emerald-600 rounded-full" />}
              </div>
              <span>Simulate Payment Success</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentOutcome("failure")}
              className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${paymentOutcome === "failure"
                ? "bg-rose-50 border-rose-500 text-rose-700 shadow-3xs"
                : "border-gray-200 text-gray-500 hover:bg-gray-50 bg-white"
                }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentOutcome === "failure" ? "border-rose-600" : "border-gray-300"
                }`}>
                {paymentOutcome === "failure" && <div className="w-2 h-2 bg-rose-600 rounded-full" />}
              </div>
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>

      </main>



      {/* 5. Global Footer Wrapper */}
      <Footer />

    </div>
  );
}