/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/components/Card.jsx
 * DESCRIPTION: Premium flight result item card matching Figma layout exactly.
 * ============================================================================
 */

import React, { useState } from "react";
import { Briefcase, Tag, Plane } from "lucide-react";

export default function Card({ flight, onSelect }) {
  // Determine badge colors dynamically (all badges use brand red in Figma)
  const badgeClasses = "bg-red-50 text-[#FF2D1A] border border-red-100";

  const [openUpward, setOpenUpward] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = (e) => {
    setIsOpen(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow < 185) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl shadow-2xs overflow-visible hover:border-gray-300 hover:shadow-xs transition-all duration-200 font-inter text-left">

      {/* Primary Details Row (No Select button here!) */}
      <div className="p-5.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">

        {/* Airline Info Block */}
        <div className="flex items-center space-x-3.5 w-full md:w-44 select-none">
          <div className="w-10 h-10 rounded-lg border border-gray-100 shadow-3xs bg-white flex-shrink-0 overflow-hidden">
            <img
              src={flight.logo}
              alt={flight.airline}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-black text-[14px] text-[#272727] tracking-tight leading-tight">{flight.airline}</h4>
            <span className="text-[11px] text-[#7E7E7E] uppercase font-bold tracking-wider block mt-1">{flight.code}</span>
          </div>
        </div>

        {/* Departure Details */}
        <div className="text-center w-24 flex-shrink-0">
          <span className="text-[24px] font-black text-[#272727] leading-none">{flight.depTime}</span>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#7E7E7E] block mt-1.5">{flight.fromCode}</span>
        </div>

        {/* Timeline Visual Progress Indicator */}
        <div className="flex-grow w-full md:max-w-xs text-center flex flex-col items-center select-none px-4">
          <span className="text-[11px] font-bold text-[#7E7E7E]">{flight.duration}</span>

          {/* Custom Timeline line with plane in center and circles on both ends */}
          <div className="relative w-full flex items-center justify-between my-1.5">
            <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="h-[1px] flex-grow bg-gray-200/80 mx-1"></div>
            <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></div>

            {/* Plane Icon inside a white box in the center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white px-2">
                <Plane className="w-3.5 h-3.5 text-[#7E7E7E] rotate-45" />
              </div>
            </div>
          </div>

          {/* Stops and Layover Hover Tooltip */}
          {(() => {
            const segments = flight.rawOption?.Segments?.[0] || [];
            let stopInfoText = flight.stops;
            if (segments.length > 1) {
              const stopsList = [];
              for (let i = 0; i < segments.length - 1; i++) {
                stopsList.push(segments[i].Destination?.AirportCode || segments[i].Destination?.Airport?.AirportCode || "");
              }
              const stopsJoined = stopsList.filter(Boolean).join(", ");
              if (stopsJoined) {
                stopInfoText = `${flight.stops} • ${stopsJoined}`;
              }
            }

            return (
              <div
                className="relative inline-block mt-0.5"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span className="text-[11px] text-[#272727] bg-[#F9F9F9] border border-[#EAEAEA] rounded-md px-2 py-0.5 font-bold cursor-pointer hover:border-gray-300 transition-colors select-none">
                  {stopInfoText}
                </span>

                {segments.length > 1 && isOpen && (
                  <div className={`absolute left-1/2 -translate-x-1/2 z-[999] pointer-events-auto ${openUpward ? "bottom-full pb-2" : "top-full pt-2"
                    }`}>
                    <div className="relative bg-white border border-[#EAEAEA] rounded-xl p-4 shadow-xl w-fit whitespace-nowrap text-center text-xs text-[#272727]">
                      {/* Tooltip Arrow */}
                      {openUpward ? (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-[#EAEAEA] rotate-45 -translate-y-[5px] z-10"></div>
                      ) : (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-l border-t border-[#EAEAEA] rotate-45 translate-y-[5px] z-10"></div>
                      )}

                      <div className="relative space-y-3.5 bg-white z-20">
                        {segments.slice(0, segments.length - 1).map((leg, idx) => {
                          const nextLeg = segments[idx + 1];
                          const stopAirport = leg.Destination;
                          const layoverMins = nextLeg?.GroundTime || 0;
                          const h = Math.floor(layoverMins / 60);
                          const m = layoverMins % 60;
                          const layoverStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
                          const isPlaneChange = leg.Airline?.FlightNumber !== nextLeg?.Airline?.FlightNumber || leg.Airline?.AirlineCode !== nextLeg?.Airline?.AirlineCode;

                          return (
                            <div key={idx} className="relative">
                              {idx > 0 && (
                                <div className="border-t border-dashed border-[#EAEAEA] my-3"></div>
                              )}
                              <div className="space-y-1.5 text-center">
                                {segments.length > 2 && (
                                  <div className="flex justify-center mb-1">
                                    <span className="inline-flex items-center justify-center text-[10px] font-black uppercase text-gray-500 bg-[#F5F5F5] border border-[#EAEAEA] rounded-full h-6 px-3.5 select-none leading-none text-center">
                                      Stop {idx + 1}
                                    </span>
                                  </div>
                                )}
                                <div className="font-extrabold text-[14px] text-[#272727] w-full text-center whitespace-nowrap">
                                  <span>{layoverStr} Layover at {stopAirport?.Airport?.CityName || stopAirport?.CityName}</span>
                                  {isPlaneChange && (
                                    <>
                                      <span className="text-gray-400 font-medium mx-1.5">•</span>
                                      <span className="text-[#FF9D00] font-extrabold">Plane Change</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-[12.5px] text-[#7E7E7E] font-medium leading-snug text-center">
                                  {stopAirport?.Airport?.AirportName || stopAirport?.AirportName} ({stopAirport?.Airport?.AirportCode || stopAirport?.AirportCode})
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Arrival Details */}
        <div className="text-center w-24 flex-shrink-0">
          <div className="relative inline-flex items-center justify-center">
            <span className="text-[24px] font-black text-[#272727] leading-none">{flight.arrTime}</span>
            {flight.dayDiff > 0 && (
              <span className="absolute left-full ml-1 text-[9px] font-bold text-[#FF2D1A] select-none flex flex-col items-start leading-[1.1] top-0 whitespace-nowrap">
                <span>+{flight.dayDiff}</span>
                <span className="text-[7px] uppercase tracking-wider text-gray-500">Day</span>
              </span>
            )}
          </div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#7E7E7E] block mt-1.5">{flight.toCode}</span>
        </div>

        {/* Price Block (Rightmost in top row) — flight.price is the REAL
            per-adult fare (from Adivaha's FareBreakdown), not the combined
            total for every traveller. When more than one traveller is on
            the search, show the all-inclusive total underneath so the
            relationship between the two numbers is clear. */}
        <div className="text-right w-full md:w-36 flex md:flex-col items-end justify-center pt-3 md:pt-0">
          <span className="text-[24px] font-black text-[#272727] leading-none">{flight.price}</span>
          <span className="text-[11px] text-[#7E7E7E] font-bold block mt-1.5">per adult</span>
          {flight.totalTravellers > 1 && (
            <span className="text-[10.5px] text-[#9A9A9A] font-semibold block mt-1">
              {flight.totalTravellers} travellers: {flight.totalPriceStr}
            </span>
          )}
        </div>

      </div>

      {/* Secondary Details & Offer Strip - White background, dashed top border */}
      <div className="bg-white border-t border-dashed border-[#EAEAEA] px-5.5 py-3 rounded-b-xl flex flex-wrap items-center justify-between gap-3 select-none">

        {/* Amenities & Discounts tags - all in clean grey style */}
        <div className="flex flex-wrap items-center gap-5 text-[12px] font-bold text-[#6B6B6B]">
          <span className="flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-[#7E7E7E]" />
            <span>{flight.save}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span>{flight.flexi}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#7E7E7E]" />
            <span>{flight.business}</span>
          </span>
        </div>

        {/* Right side items: Select button (no Cheap/Fast badges) */}
        <div className="flex items-center space-x-3.5 ml-auto">
          <button
            onClick={onSelect}
            className="w-[160px] h-[40px] rounded-lg bg-[#FF2D1A] hover:bg-red-700 text-white font-black text-[13px] tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center select-none"
          >
            Select
          </button>
        </div>

      </div>

    </div>
  );
}
