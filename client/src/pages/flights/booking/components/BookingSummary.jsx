/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingSummary.jsx
 * DESCRIPTION: Left-side/Right-side dedicated booking timing summary panel.
 * ============================================================================
 */

import React from "react";
import { Plane } from "lucide-react";

export default function BookingSummary({ flight }) {
  const segments = flight.rawOption?.Segments?.[0] || [];
  const firstLeg = segments[0] || {};
  const lastLeg = segments[segments.length - 1] || firstLeg;

  // Adivaha's numeric CabinClass code on the segment is the actual cabin
  // booked (1=All/Unspecified, 2=Economy, 3=Premium Economy, 4=Business,
  // 5=Premium Business, 6=First) — this is the real signal, not
  // FareClassification.Type (which is a fare *distribution* tag like
  // "PublishNDC"/"LCC", not a cabin name). Previously this label silently
  // defaulted to "Economy" whenever FareClassification.Type was absent,
  // which is wrong for any Business/First class result and conflates two
  // unrelated API fields.
  const CABIN_CLASS_LABELS = { 1: "Economy", 2: "Economy", 3: "Premium Economy", 4: "Business", 5: "Premium Business", 6: "First" };
  const cabinLabel = CABIN_CLASS_LABELS[firstLeg?.CabinClass] || flight.rawOption?.FareClassification?.Type || "Economy";

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-2xs text-left font-inter select-none">
      <h3 className="text-[18.57px] font-bold text-[#1A1A1A] mb-1 font-inter">Booking Summary</h3>
      <p className="text-[15.09px] text-[#666666] font-normal mb-5 font-inter">Review your trip details</p>

      <div className="flex items-center space-x-4 border-b border-[#EAEAEA] pb-5 mb-5">
        <div className="w-[37px] h-[37px] rounded-lg border border-gray-100 bg-white flex-shrink-0 overflow-hidden">
          <img src={flight.logo} alt={flight.airline} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-[16.25px] font-medium text-[#333333] font-inter">{flight.airline} - {flight.code}</h4>
          <div className="text-[13.93px] text-[#666666] font-normal font-inter mt-1 flex flex-col space-y-0.5">
            <span>{flight.fromCode} → {flight.toCode}</span>
            <span>{formatDate(firstLeg?.Origin?.DepTime)} • {cabinLabel}</span>
          </div>
        </div>
      </div>

      {/* Departure & Arrival row details */}
      <div className="flex items-center justify-between gap-4 text-xs font-bold text-gray-800">
        <div>
          <span className="text-[17.41px] font-bold block text-[#333333] font-inter">{flight.depTime}</span>
          <span className="text-[13.93px] font-normal text-[#666666] block mt-1 font-inter">{flight.fromCode}</span>
        </div>

        <div className="flex-grow max-w-[200px] text-center flex flex-col items-center">
          <span className="text-[12.77px] font-normal text-[#999999] font-inter">{flight.duration}</span>
          
          <div className="relative w-full flex items-center justify-between my-2.5">
            <div className="w-[6px] h-[6px] rounded-full bg-[#EAEAEA]"></div>
            <div className="h-[1px] flex-grow bg-[#EAEAEA]"></div>
            <div className="w-[6px] h-[6px] rounded-full bg-[#EAEAEA]"></div>
            
            {/* Dot in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[12px] h-[12px] rounded-full bg-white border border-[#999999] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#999999]"></span>
              </div>
            </div>
          </div>

          <span className="text-[11.60px] font-normal text-[#666666] font-inter">{flight.stops}</span>
        </div>

        <div className="text-right">
          <div className="relative inline-flex items-center justify-end">
            <span className="text-[17.41px] font-bold block text-[#333333] font-inter">{flight.arrTime}</span>
            {flight.dayDiff > 0 && (
              <span className="absolute left-full ml-1 text-[9px] font-bold text-[#FF2D1A] select-none flex flex-col items-start leading-[1.1] top-0 whitespace-nowrap">
                <span>+{flight.dayDiff}</span>
                <span className="text-[7px] uppercase tracking-wider text-gray-500">Day</span>
              </span>
            )}
          </div>
          <span className="text-[13.93px] font-normal text-[#666666] block mt-1 font-inter">{flight.toCode}</span>
        </div>
      </div>

    </div>
  );
}
