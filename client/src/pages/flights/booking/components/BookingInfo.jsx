/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingInfo.jsx
 * DESCRIPTION: Passenger details and contact information input form (Step 1).
 *
 * DYNAMIC BY DESIGN — this is NOT a static domestic/international form.
 * Every field beyond name/DOB/gender (Passport, PAN, GST) is shown and
 * marked required ONLY when `computeFlightRequirements()` (see
 * client/src/utils/flightRequirements.js) says this specific itinerary
 * needs it — which itself inspects every segment on the itinerary plus
 * Adivaha's own IsPassportRequiredAtBook/AtTicket, IsPanRequiredAtBook/
 * AtTicket, GSTAllowed/IsGSTMandatory flags rather than guessing from
 * origin/destination alone. Fields required "AtTicket" are still collected
 * here (before payment) — see the engine for why.
 * ============================================================================
 */

import React, { useMemo, useState } from "react";
import { Mail, User, ChevronDown, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { computeFlightRequirements, validatePassengersAgainstRequirements } from "../../../../utils/flightRequirements";

const emptyPax = (title) => ({
  title,
  firstName: "",
  lastName: "",
  gender: title === "Mrs" || title === "Ms" ? "Female" : "Male",
  dob: "",
  passportNo: "",
  passportExpiry: "",
  passportIssuePlace: "",
  passportIssueDate: "",
  pan: ""
});

// ----------------------------------------------------------------------------
// Reusable passenger card. Renders Passport/PAN sub-fields conditionally
// based on the requirements computed for THIS itinerary — not a fixed shape.
// ----------------------------------------------------------------------------
function PassengerCard({ label, pax, onChange, req }) {
  const set = (field, value) => onChange({ ...pax, [field]: value });
  const passportRequired = !!req?.passportRequired;
  const fullDetailRequired = !!req?.passportFullDetailRequired;
  const panRequired = !!req?.panRequired;

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-3xs">
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3.5 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-md bg-[#FF2D1A] flex items-center justify-center text-white">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[15px] text-[#1E293B]">{label}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#64748B]" />
      </div>

      <div className="p-5 space-y-4">
        {/* Row 1: Title, First Name, Last Name — always required */}
        <div className="grid grid-cols-1 md:grid-cols-[110px_1fr_1fr] gap-[16px]">
          <div className="text-left relative">
            <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Title *</span>
            <div className="relative">
              <select
                value={pax.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg pl-3 pr-7 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] cursor-pointer appearance-none"
              >
                <option>Mr</option>
                <option>Mrs</option>
                <option>Ms</option>
                <option>Master</option>
                <option>Miss</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-left">
            <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">First &amp; Middle Name *</span>
            <input
              type="text"
              required
              value={pax.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              placeholder="Enter first & middle name"
              className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] placeholder-[#94A3B8]"
            />
          </div>

          <div className="text-left">
            <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Last Name *</span>
            <input
              type="text"
              required
              value={pax.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              placeholder="Enter last name"
              className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] placeholder-[#94A3B8]"
            />
          </div>
        </div>

        {/* Row 2: Gender, DOB — always required */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          <div className="text-left relative">
            <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Gender *</span>
            <div className="relative">
              <select
                value={pax.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg pl-3 pr-7 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] cursor-pointer appearance-none"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-left">
            <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Date of Birth *</span>
            <input
              type="date"
              required
              value={pax.dob}
              onChange={(e) => set("dob", e.target.value)}
              className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A]"
            />
          </div>
        </div>

        {/* Row 3: Passport — ONLY rendered when this itinerary requires it */}
        {passportRequired && (
          <div className="space-y-4 pt-1 border-t border-dashed border-[#E2E8F0]">
            <p className="text-[11px] font-bold text-[#B45309] flex items-center gap-1.5 pt-3">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Passport Details (Mandatory)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="text-left">
                <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Passport Number *</span>
                <input
                  type="text"
                  required
                  value={pax.passportNo}
                  onChange={(e) => set("passportNo", e.target.value.toUpperCase())}
                  placeholder="e.g. M1234567"
                  className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] placeholder-[#94A3B8] uppercase"
                />
              </div>
              <div className="text-left">
                <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Passport Expiry *</span>
                <input
                  type="date"
                  required
                  value={pax.passportExpiry}
                  onChange={(e) => set("passportExpiry", e.target.value)}
                  className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A]"
                />
              </div>
            </div>

            {/* Only when the fare flags IsPassportFullDetailRequiredAtBook */}
            {fullDetailRequired && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="text-left">
                  <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Passport Place of Issue *</span>
                  <input
                    type="text"
                    required
                    value={pax.passportIssuePlace}
                    onChange={(e) => set("passportIssuePlace", e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] placeholder-[#94A3B8]"
                  />
                </div>
                <div className="text-left">
                  <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">Passport Issue Date *</span>
                  <input
                    type="date"
                    required
                    value={pax.passportIssueDate}
                    onChange={(e) => set("passportIssueDate", e.target.value)}
                    className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAN — ONLY rendered when IsPanRequiredAtBook/AtTicket is true */}
        {panRequired && (
          <div className="pt-1 border-t border-dashed border-[#E2E8F0]">
            <p className="text-[11px] font-bold text-[#B45309] flex items-center gap-1.5 pt-3 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              PAN required for this booking
            </p>
            <div className="text-left max-w-xs">
              <span className="text-[12px] font-medium text-[#64748B] block mb-1.5 font-inter">PAN Number *</span>
              <input
                type="text"
                required
                maxLength={10}
                value={pax.pan}
                onChange={(e) => set("pan", e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="w-full h-[44px] bg-white border border-[#CBD5E1] rounded-lg px-3.5 text-[14px] font-medium text-[#0F172A] focus:outline-none focus:border-[#FF2D1A] placeholder-[#94A3B8] uppercase"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingInfo({ onContinue, adultsCount = 1, childrenCount = 0, infantsCount = 0, flight }) {
  const adultCountSafe = Math.max(1, parseInt(adultsCount, 10) || 1);
  const childCountSafe = Math.max(0, parseInt(childrenCount, 10) || 0);
  const infantCountSafe = Math.max(0, parseInt(infantsCount, 10) || 0);

  // Dynamic requirements for THIS itinerary — recomputed if the flight
  // option changes (e.g. FareQuote restore-on-refresh resolves after mount).
  // `flight` may be a single rawOption or an array of them (round-trip).
  const requirements = useMemo(() => computeFlightRequirements(flight || null), [flight]);
  const perType = requirements.perPassengerType;
  const itinReq = requirements.itinerary;

  // Contact details used for booking confirmation + Adivaha lead-pax contact fields
  const [contactMobile, setContactMobile] = useState("");
  const [contactCode, setContactCode] = useState("+91");
  const [contactEmail, setContactEmail] = useState("");

  // Passenger detail arrays, one entry per traveller in each category
  const [adults, setAdults] = useState(() => Array.from({ length: adultCountSafe }, () => emptyPax("Mr")));
  const [children, setChildren] = useState(() => Array.from({ length: childCountSafe }, () => emptyPax("Master")));
  const [infants, setInfants] = useState(() => Array.from({ length: infantCountSafe }, () => emptyPax("Master")));

  // Shared travel-document details Adivaha's Passengers[] schema repeats on
  // every entry (AddressLine1, City, CountryCode, CountryName, Nationality)
  const [nationality, setNationality] = useState("IN");
  const [city, setCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");

  // GST — only ever shown/collected when this fare's GSTAllowed flag is true.
  const [gstin, setGstin] = useState("");
  const [gstCompanyName, setGstCompanyName] = useState("");

  const updatePax = (setter, idx, updated) => {
    setter((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  };

  const [validationErrors, setValidationErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const passengers = [
      ...adults.map((p, idx) => ({ paxType: 1, ...p, isLeadPax: idx === 0 })),
      ...children.map((p) => ({ paxType: 2, ...p, isLeadPax: false })),
      ...infants.map((p) => ({ paxType: 3, ...p, isLeadPax: false }))
    ];

    const validation = validatePassengersAgainstRequirements(requirements, passengers, {
      contact: { mobile: contactMobile, email: contactEmail },
      sharedDetails: { nationality, city, addressLine1, gstin, gstCompanyName },
      gstin: itinReq?.gst?.mandatory ? gstin : undefined,
      gstCompanyName: itinReq?.gst?.mandatory ? gstCompanyName : undefined
    });

    if (!validation.valid) {
      setValidationErrors(validation.missingFields);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setValidationErrors([]);

    onContinue({
      contact: {
        mobile: contactMobile,
        countryCode: contactCode,
        email: contactEmail
      },
      sharedDetails: {
        nationality,
        city,
        addressLine1,
        gstin: itinReq?.gst?.allowed ? gstin : "",
        gstCompanyName: itinReq?.gst?.allowed ? gstCompanyName : ""
      },
      passengers,
      requirements
    });
  };

  const renderGroup = (title, list, setter, paxType) => (
    list.length > 0 && (
      <div className="space-y-4 pt-2">
        <h4 className="text-[13px] font-extrabold text-[#555555] uppercase tracking-wider text-left font-inter">{title}</h4>
        {list.map((pax, idx) => (
          <PassengerCard
            key={`${title}-${idx}`}
            label={`${title.charAt(0)}${title.slice(1).toLowerCase()} ${idx + 1}`}
            pax={pax}
            onChange={(updated) => updatePax(setter, idx, updated)}
            req={perType[paxType]}
          />
        ))}
      </div>
    )
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-left">

      {/* Validation Errors banner */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((err, i) => (
            <div key={`err-${i}`} className="flex items-start gap-2.5 bg-rose-50 border border-rose-300 rounded-xl px-4 py-3 text-xs font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Itinerary-level advisories — surfaces AirlineRemark / TicketAdvisory
          / low-availability / ticketing-deadline warnings from the dynamic
          requirements engine. Never purely decorative text: these are real
          supplier instructions. */}
      {(requirements.warnings.length > 0 || requirements.blockers.length > 0) && (
        <div className="space-y-2">
          {requirements.blockers.map((b, i) => (
            <div key={`blk-${i}`} className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs font-bold text-rose-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
          {requirements.warnings.slice(0, 4).map((w, i) => (
            <div key={`warn-${i}`} className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-semibold text-amber-800">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* 1. Contact Information Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
        <h3 className="text-[18.57px] font-bold text-[#1A1A1A] mb-1 font-inter">Contact Information</h3>
        <p className="text-[15.09px] text-[#666666] font-normal mb-6 font-inter">We will send booking details to this contact</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {/* Mobile input */}
          <div className="text-left">
            <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">Mobile Number *</span>
            <div className="flex items-center space-x-2.5">
              {/* Country Code Dropdown */}
              <div className="relative flex-shrink-0 w-[107px]">
                <select
                  value={contactCode}
                  onChange={(e) => setContactCode(e.target.value)}
                  className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg pl-4 pr-8 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none cursor-pointer appearance-none"
                >
                  <option>+91</option>
                  <option>+1</option>
                  <option>+44</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#666666] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Phone Input */}
              <input
                type="tel"
                required
                value={contactMobile}
                onChange={(e) => setContactMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575]"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="text-left">
            <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">Email Address *</span>
            <div className="flex border border-[#EAEAEA] rounded-lg bg-white items-center px-4 h-[50px]">
              <Mail className="w-[16.25px] h-[16.25px] text-[#666666] mr-2.5 flex-shrink-0" />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full py-2 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575]"
              />
            </div>
          </div>
        </div>

        {/* Checkbox confirmation */}
        <label className="flex items-center space-x-3.5 mt-[24px] text-[15.09px] font-normal text-[#666666] cursor-pointer select-none">
          <input
            type="checkbox"
            defaultChecked
            className="w-[19px] h-[19px] rounded-xs border border-gray-300 accent-[#FF2D1A] cursor-pointer flex-shrink-0"
          />
          <span className="font-inter">Send booking confirmation and ticket details to this email address</span>
        </label>
      </div>

      {/* 2. Passenger Details Section — dynamically shaped per traveller
          category by the requirements engine (passport/PAN fields appear
          only when THIS itinerary actually needs them). */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[28px] shadow-2xs font-inter space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAEAEA]">
          <div>
            <h3 className="text-[18.57px] font-bold text-[#1A1A1A] font-inter">Travellers Details</h3>
            <p className="text-[13.5px] text-[#666666] font-normal font-inter">Enter passenger details as per government ID</p>
          </div>
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D4ED8] flex items-center space-x-2 select-none self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            <span>Name should be same as in government ID proof</span>
          </div>
        </div>

        {renderGroup("ADULT", adults, setAdults, 1)}
        {renderGroup("CHILD", children, setChildren, 2)}
        {renderGroup("INFANT", infants, setInfants, 3)}

      </div>

      {/* 3. Shared Nationality / Address block — Adivaha repeats
          AddressLine1/City/CountryCode/CountryName/Nationality on every
          Passengers[] entry; collected once here and applied to all
          travellers rather than asking for a separate address per family
          member. */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
        <h3 className="text-[18.57px] font-bold text-[#1A1A1A] mb-1 font-inter">Address &amp; Nationality</h3>
        <p className="text-[15.09px] text-[#666666] font-normal mb-6 font-inter">Required by the airline for ticketing — applied to all travellers on this booking</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          <div className="text-left">
            <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">Nationality *</span>
            <select
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none cursor-pointer appearance-none"
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">United Arab Emirates</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="SG">Singapore</option>
            </select>
          </div>

          <div className="text-left">
            <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">City *</span>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575]"
            />
          </div>

          <div className="text-left">
            <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">Address Line 1 *</span>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House no., street, area"
              className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575]"
            />
          </div>
        </div>
      </div>

      {/* 4. GST Details — ONLY rendered when this fare's GSTAllowed flag is
          true. Required only when IsGSTMandatory is true; otherwise offered
          as an optional business-invoice field. */}
      {itinReq?.gst?.allowed && (
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
          <h3 className="text-[18.57px] font-bold text-[#1A1A1A] mb-1 font-inter flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            GST Details {itinReq.gst.mandatory ? "(Mandatory for this fare)" : "(Optional — for business invoice)"}
          </h3>
          <p className="text-[15.09px] text-[#666666] font-normal mb-6 font-inter">
            {itinReq.gst.mandatory
              ? "This fare requires GST details to be submitted before booking."
              : "Add your company GSTIN to receive a GST invoice for this booking."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            <div className="text-left">
              <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">GSTIN {itinReq.gst.mandatory && "*"}</span>
              <input
                type="text"
                required={itinReq.gst.mandatory}
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 07AAACF1234M1ZV"
                className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575] uppercase"
              />
            </div>

            <div className="text-left">
              <span className="text-[13.93px] font-normal text-[#666666] block mb-2 font-inter">Registered Company Name {itinReq.gst.mandatory && "*"}</span>
              <input
                type="text"
                required={itinReq.gst.mandatory}
                value={gstCompanyName}
                onChange={(e) => setGstCompanyName(e.target.value)}
                placeholder="As registered with GST"
                className="w-full h-[50px] bg-white border border-[#EAEAEA] rounded-lg px-4 text-[16.25px] font-normal text-[#1A1A1A] focus:outline-none placeholder-[#757575]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Continue CTA Button — disabled outright if the requirements engine
          reports a hard blocker (e.g. stale/expired ticketing deadline, no
          seats and not bookable-on-request) so the user isn't allowed to
          fill in a form for an itinerary that cannot be booked at all. */}
      <button
        type="submit"
        disabled={requirements.blockers.length > 0}
        className="w-full h-[60px] bg-[#FF2D1A] hover:bg-red-700 text-white font-semibold text-[18.57px] rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm select-none cursor-pointer active:scale-[0.99] font-inter disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{requirements.blockers.length > 0 ? "This fare cannot be booked" : "Continue"}</span>
        {requirements.blockers.length === 0 && (
          <svg className="w-[18.57px] h-[18.57px] text-white stroke-[3] fill-none" viewBox="0 0 24 24" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        )}
      </button>

    </form>
  );
}
