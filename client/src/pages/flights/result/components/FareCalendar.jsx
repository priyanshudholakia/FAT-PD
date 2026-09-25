/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/components/FareCalendar.jsx
 * DESCRIPTION: Dynamic date-wise price calendar strip fetching live Adivaha fares.
 * ============================================================================
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FareCalendar({ 
  depDate,
  calendarCenterDate,
  calendarFares = {},
  onDateSelect,
  onCenterDateChange
}) {
  if (!depDate) return null;

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dateStr);
  };

  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dateNum = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${dateNum}`;
  };

  // Generate 7 days centered around the selected/shifted calendar center date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const centerDate = parseLocalDate(calendarCenterDate || depDate);
  centerDate.setHours(0, 0, 0, 0);

  // Default start is centerDate - 3 days
  let startDate = new Date(centerDate);
  startDate.setDate(centerDate.getDate() - 3);

  // Shift window forward if start date is in the past
  if (startDate < today) {
    startDate = new Date(today);
  }

  const isPrevDisabled = getLocalDateString(startDate) === getLocalDateString(today);
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    // Format YYYY-MM-DD key for Adivaha lookup
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dateNum = String(d.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${dateNum}`;

    // Format UI labels
    const dateLabel = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    
    // Check if there is a cached/loaded fare
    const priceVal = calendarFares[dateKey];
    const priceStr = priceVal ? `₹${Math.round(priceVal).toLocaleString()}` : "Get Fare";

    dates.push({
      dateKey,
      dateLabel,
      dayLabel,
      price: priceStr,
      hasPrice: !!priceVal,
      isToday: dateKey === depDate
    });
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-xl p-3 shadow-2xs font-inter text-left animate-fade-in">
      
      {/* Date Cards Row */}
      <div className="flex items-center space-x-3 select-none">
        {/* Previous page navigation arrow (shifts -7 days from visible start) */}
        <span className={isPrevDisabled ? "cursor-not-allowed" : ""}>
          <button 
            disabled={isPrevDisabled}
            onClick={() => {
              if (isPrevDisabled) return;
              const prevDate = new Date(startDate);
              prevDate.setDate(startDate.getDate() - 4);
              const prevStr = getLocalDateString(prevDate);
              onCenterDateChange(prevStr);
            }}
            className={`w-8 h-8 rounded-full border border-[#EAEAEA] bg-white flex items-center justify-center text-gray-500 transition-colors shadow-2xs flex-shrink-0 ${
              isPrevDisabled 
                ? "opacity-40 pointer-events-none" 
                : "hover:bg-gray-50 hover:text-gray-700 active:scale-90 cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4 text-[#272727]" />
          </button>
        </span>
 
        <div className="grid grid-cols-7 gap-2 flex-grow">
          {dates.map((cal, idx) => {
            const isSelected = cal.isToday;
            return (
              <div
                key={idx}
                onClick={() => onDateSelect(cal.dateKey)}
                className={`border p-2.5 rounded-xl text-center cursor-pointer transition-all hover:scale-102 ${
                  isSelected
                    ? "bg-[#FF2D1A] border-[#FF2D1A] text-white shadow-md"
                    : "bg-white border-[#EAEAEA] hover:border-red-300 hover:bg-red-50/10 text-[#272727]"
                }`}
              >
                <span className={`text-[11.5px] font-bold block leading-tight ${isSelected ? "text-white" : "text-[#7E7E7E]"}`}>
                  {cal.dayLabel}, {cal.dateLabel}
                </span>
                <span className={`text-[12.5px] font-black block mt-2 leading-none ${
                  isSelected 
                    ? "text-white" 
                    : cal.hasPrice 
                      ? "text-[#FF2D1A]" 
                      : "text-gray-400 text-[10.5px] font-bold"
                }`}>
                  {cal.price}
                </span>
              </div>
            );
          })}
        </div>
 
        {/* Next page navigation arrow (shifts +7 days from visible start) */}
        <button 
          onClick={() => {
            const nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + 10);
            const nextStr = getLocalDateString(nextDate);
            onCenterDateChange(nextStr);
          }}
          className="w-8 h-8 rounded-full border border-[#EAEAEA] bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-2xs active:scale-90 flex-shrink-0 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-[#272727]" />
        </button>
      </div>
 
    </div>
  );
}
