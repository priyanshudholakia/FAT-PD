/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/components/Filters.jsx
 * DESCRIPTION: Sidebar filter controller section matching Figma layout specs.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Search, SlidersHorizontal } from "lucide-react";

export default function Filters({
  flights = [],
  activeFilters = { stops: [], airlines: [], maxPrice: 15000, depTimes: [], arrTimes: [] },
  setActiveFilters,
  priceLimits = { min: 1000, max: 15000 }
}) {
  // Collapsible toggle sections state
  const [openSections, setOpenSections] = useState({
    stops: true,
    airlines: true,
    price: true,
    departure: true,
    arrival: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const minLimit = priceLimits.min;
  const maxLimit = priceLimits.max;

  // Price range slider state and drag handler matching Figma
  const [minPrice, setMinPrice] = useState(priceLimits.min);
  const [maxPrice, setMaxPrice] = useState(priceLimits.max);

  const containerRef = useRef(null);

  // Synchronize price states when priceLimits changes
  useEffect(() => {
    setMinPrice(priceLimits.min);
    setMaxPrice(activeFilters.maxPrice !== null ? activeFilters.maxPrice : priceLimits.max);
  }, [priceLimits, activeFilters.maxPrice]);

  const range = maxLimit - minLimit;
  const leftPercent = range > 0 ? ((minPrice - minLimit) / range) * 100 : 0;
  const rightPercent = range > 0 ? 100 - ((maxPrice - minLimit) / range) * 100 : 0;

  const handleStartDrag = (e, handleType) => {
    e.preventDefault();
    const handleMove = (moveEvent) => {
      if (!containerRef.current) return;
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const value = Math.round(minLimit + percent * (maxLimit - minLimit));

      if (handleType === "min") {
        const val = Math.min(value, maxPrice - 500);
        setMinPrice(val);
      } else {
        const val = Math.max(value, minPrice + 500);
        setMaxPrice(val);
        setActiveFilters(prev => ({ ...prev, maxPrice: val }));
      }
    };

    const handleStop = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleStop);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleStop);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleStop);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleStop);
  };

  // Toggle checklist states
  const handleToggle = (field, value) => {
    setActiveFilters(prev => {
      const current = prev[field] || [];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        [field]: next
      };
    });
  };

  const handleResetAll = () => {
    setActiveFilters({
      stops: [],
      airlines: [],
      maxPrice: maxLimit,
      depTimes: [],
      arrTimes: []
    });
  };

  // Cheapest prices dynamically
  const getCheapestForStops = (stopId) => {
    const matching = flights.filter(f => f.stops === stopId);
    if (matching.length === 0) return "--";
    const prices = matching.map(f => f.priceRaw);
    return `₹${Math.round(Math.min(...prices)).toLocaleString()}`;
  };

  // Extract airlines list dynamically
  const uniqueAirlines = [];
  const seenCodes = new Set();
  flights.forEach(f => {
    const code = f.code.split("-")[0];
    if (code && !seenCodes.has(code)) {
      seenCodes.add(code);
      const sameAirline = flights.filter(item => item.code.split("-")[0] === code);
      const minPrice = Math.round(Math.min(...sameAirline.map(item => item.priceRaw)));
      uniqueAirlines.push({
        code,
        name: f.airline,
        priceStr: `₹${minPrice.toLocaleString()}`
      });
    }
  });

  const [airlineSearch, setAirlineSearch] = useState("");
  const displayedAirlines = uniqueAirlines.filter(a =>
    a.name.toLowerCase().includes(airlineSearch.toLowerCase())
  );

  return (
    <aside className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs font-inter text-left space-y-5 select-none sticky top-[190px]">

      {/* Header controls row */}
      <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-[#272727] stroke-[2.5]" />
          <span className="font-extrabold text-[13px] text-[#272727] tracking-wider uppercase">FILTERS</span>
        </div>
        <button
          onClick={handleResetAll}
          className="text-[12px] font-extrabold text-[#FF2D1A] hover:text-red-750 transition-colors cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STOPS FILTER                                                           */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("stops")}
          className="flex items-center justify-between w-full font-extrabold text-xs text-gray-800 focus:outline-none cursor-pointer"
        >
          <span>STOPS</span>
          {openSections.stops ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {openSections.stops && (
          <div className="mt-3.5 space-y-3.5">
            {[
              { id: "Non-stop", label: "Non-Stop" },
              { id: "1 Stop", label: "1 Stop" },
              { id: "2+ Stops", label: "2+ Stops" }
            ].map((option) => {
              const isChecked = activeFilters.stops.includes(option.id);
              const cheapest = getCheapestForStops(option.id);
              return (
                <label key={option.id} className="flex items-center justify-between text-xs font-bold text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle("stops", option.id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF2D1A] focus:ring-[#FF2D1A] accent-[#FF2D1A] cursor-pointer"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </div>
                  <span className="text-gray-450 font-semibold">{cheapest}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. AIRLINES FILTER                                                        */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("airlines")}
          className="flex items-center justify-between w-full font-extrabold text-xs text-gray-800 focus:outline-none cursor-pointer"
        >
          <span>AIRLINES</span>
          {openSections.airlines ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {openSections.airlines && (
          <div className="mt-3.5 space-y-3.5">
            {/* Search inputs matching Figma search console */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search airlines"
                value={airlineSearch}
                onChange={(e) => setAirlineSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-750 font-semibold focus:outline-none placeholder-gray-400 focus:border-red-300 focus:ring-1 focus:ring-red-200 transition-all"
              />
            </div>

            <div className="space-y-3.5 pt-1 max-h-52 overflow-y-auto pr-1">
              {displayedAirlines.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">No airlines available</div>
              ) : (
                displayedAirlines.map((airline) => {
                  const isChecked = activeFilters.airlines.includes(airline.code);
                  return (
                    <label key={airline.code} className="flex items-center justify-between text-xs font-bold text-gray-600 cursor-pointer select-none hover:text-gray-900 transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle("airlines", airline.code)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF2D1A] focus:ring-[#FF2D1A] accent-[#FF2D1A] cursor-pointer"
                        />
                        <span className="text-gray-700">{airline.name}</span>
                      </div>
                      <span className="text-gray-450 font-semibold">{airline.priceStr}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PRICE RANGE FILTER                                                     */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full font-extrabold text-xs text-[#272727] focus:outline-none cursor-pointer"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {openSections.price && (
          <div className="mt-4 px-1 select-none">
            {/* Prices Row: Above the slider matching Figma */}
            <div className="flex justify-between items-center text-[13px] font-extrabold text-[#272727] mb-2.5">
              <span>₹{minPrice.toLocaleString()}</span>
              <span>₹{maxPrice.toLocaleString()}</span>
            </div>

            {/* Custom slider track and handles */}
            <div
              ref={containerRef}
              className="relative w-full h-6 flex items-center"
            >
              {/* Underlying custom track */}
              <div className="absolute left-0 right-0 h-[4px] bg-[#EAEAEA] rounded-full"></div>

              {/* Custom active range segment */}
              <div
                className="absolute h-[4px] bg-[#FF2D1A] rounded-full"
                style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
              ></div>

              {/* Custom White-Red Thumb handles */}
              <div
                onMouseDown={(e) => handleStartDrag(e, "min")}
                onTouchStart={(e) => handleStartDrag(e, "min")}
                className="absolute w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#FF2D1A] shadow-sm -translate-y-1/2 -translate-x-1/2 cursor-pointer z-30 touch-none active:scale-110 transition-transform hidden"
                style={{ left: `${leftPercent}%`, top: "50%" }}
              ></div>

              <div
                onMouseDown={(e) => handleStartDrag(e, "max")}
                onTouchStart={(e) => handleStartDrag(e, "max")}
                className="absolute w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#FF2D1A] shadow-sm -translate-y-1/2 -translate-x-1/2 cursor-pointer z-30 touch-none active:scale-110 transition-transform"
                style={{ left: `${100 - rightPercent}%`, top: "50%" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DEPARTURE TIME FILTER                                                  */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("departure")}
          className="flex items-center justify-between w-full font-extrabold text-xs text-gray-800 focus:outline-none cursor-pointer"
        >
          <span>DEPARTURE TIME</span>
          {openSections.departure ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {openSections.departure && (
          <div className="mt-3.5 space-y-3.5">
            {[
              { id: "early", label: "Early Morning (00:00 - 06:00)" },
              { id: "morning", label: "Morning (06:00 - 12:00)" },
              { id: "afternoon", label: "Afternoon (12:00 - 18:00)" },
              { id: "evening", label: "Evening (18:00 - 24:00)" }
            ].map((time) => {
              const isChecked = activeFilters.depTimes.includes(time.id);
              return (
                <label key={time.id} className="flex items-center space-x-2.5 text-xs font-bold text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("depTimes", time.id)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF2D1A] focus:ring-[#FF2D1A] accent-[#FF2D1A]"
                  />
                  <span className="text-gray-750 font-semibold">{time.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ARRIVAL TIME FILTER                                                    */}
      {/* ========================================================================= */}
      <div>
        <button
          onClick={() => toggleSection("arrival")}
          className="flex items-center justify-between w-full font-extrabold text-xs text-gray-800 focus:outline-none cursor-pointer"
        >
          <span>ARRIVAL TIME</span>
          {openSections.arrival ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {openSections.arrival && (
          <div className="mt-3.5 space-y-3.5">
            {[
              { id: "early", label: "Early Morning (00:00 - 06:00)" },
              { id: "morning", label: "Morning (06:00 - 12:00)" },
              { id: "afternoon", label: "Afternoon (12:00 - 18:00)" },
              { id: "evening", label: "Evening (18:00 - 24:00)" }
            ].map((time) => {
              const isChecked = activeFilters.arrTimes.includes(time.id);
              return (
                <label key={time.id} className="flex items-center space-x-2.5 text-xs font-bold text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle("arrTimes", time.id)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#FF2D1A] focus:ring-[#FF2D1A] accent-[#FF2D1A]"
                  />
                  <span className="text-gray-750 font-semibold">{time.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}
