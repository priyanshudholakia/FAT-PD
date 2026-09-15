/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingSeat.jsx
 * DESCRIPTION: Interactive flight seat map selector console (Step 2).
 * ============================================================================
 */

import React, { useState } from "react";
import { Plane } from "lucide-react";

export default function BookingSeat({ onContinue, onSeatSelect, onSeatPriceSelect, ssrData, loadingSSR }) {
  // Helper to safely extract RowSeats from any SSR API response structure
  const getRowSeatsArray = (data) => {
    if (!data) return null;
    if (Array.isArray(data.SeatDynamic)) {
      for (const sd of data.SeatDynamic) {
        if (Array.isArray(sd?.SegmentSeat)) {
          for (const ss of sd.SegmentSeat) {
            if (Array.isArray(ss?.RowSeats)) return ss.RowSeats;
          }
        }
        if (Array.isArray(sd?.RowSeats)) return sd.RowSeats;
      }
    }
    if (Array.isArray(data.SegmentSeat)) {
      for (const ss of data.SegmentSeat) {
        if (Array.isArray(ss?.RowSeats)) return ss.RowSeats;
      }
    }
    if (Array.isArray(data.RowSeats)) return data.RowSeats;
    return null;
  };

  const apiRowsMap = {};
  const rowSeatsArr = getRowSeatsArray(ssrData);

  if (Array.isArray(rowSeatsArr)) {
    rowSeatsArr.forEach(rowItem => {
      if (Array.isArray(rowItem.Seats)) {
        rowItem.Seats.forEach(seat => {
          if (seat.Code && seat.Code !== "NoSeat") {
            const rowNo = seat.RowNo || seat.Code.replace(/[^0-9]/g, "");
            const seatLetter = seat.SeatNo || seat.Code.replace(/[0-9]/g, "");
            if (rowNo && seatLetter) {
              if (!apiRowsMap[rowNo]) apiRowsMap[rowNo] = {};
              apiRowsMap[rowNo][seatLetter] = {
                code: seat.Code,
                price: seat.Price || 0,
                isTaken: seat.AvailablityType === 3,
                isWindow: seat.SeatType === 1 || seatLetter === "A" || seatLetter === "F",
                isExit: parseInt(rowNo, 10) === 12 || parseInt(rowNo, 10) === 13,
                rawObj: seat
              };
            }
          }
        });
      }
    });
  }

  const hasApiSeats = Object.keys(apiRowsMap).length > 0;
  const apiRowNumbers = hasApiSeats ? Object.keys(apiRowsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)) : [];

  // State for user's selected seat
  const [selectedSeat, setSelectedSeat] = useState("");
  const [selectedSeatPrice, setSelectedSeatPrice] = useState(0);

  const handleSeatClick = (seatCode, price = 0, isTaken = false, rawObj = null) => {
    if (isTaken) return;

    if (selectedSeat === seatCode) {
      setSelectedSeat("");
      setSelectedSeatPrice(0);
      onSeatSelect("", null);
      if (onSeatPriceSelect) onSeatPriceSelect(0);
    } else {
      setSelectedSeat(seatCode);
      setSelectedSeatPrice(price);
      // Pass the raw SSR seat object up too — Adivaha's booking payload needs
      // the full SeatDynamic entry (AirlineCode, FlightNumber, Origin,
      // Destination, Code, RowNo, SeatNo, ...), not just the seat code label.
      onSeatSelect(seatCode, rawObj);
      if (onSeatPriceSelect) onSeatPriceSelect(price);
    }
  };

  const getSeatStyles = (seatCode, seatData) => {
    if (selectedSeat === seatCode) {
      return "bg-[#FF2D1A] border-[#FF2D1A] text-white font-black shadow-md scale-110 z-10 ring-2 ring-red-300";
    }

    if (seatData) {
      if (seatData.isTaken) return "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed opacity-50";
      if (seatData.isExit) return "bg-[#FEF3C7] border-[#FCD34D] text-[#D97706] hover:bg-[#FDE68A] font-bold";
      if (seatData.isWindow) return "bg-[#DBEAFE] border-[#93C5FD] text-[#1C3FAA] hover:bg-[#BFDBFE] font-bold";
      if (seatData.price > 0) return "bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100 font-extrabold";
      return "bg-white border-[#EAEAEA] text-[#333333] hover:bg-gray-100 font-medium";
    }

    return "bg-white border-[#EAEAEA] text-[#333333] hover:bg-gray-50 font-medium";
  };

  return (
    <div className="space-y-6 font-inter text-left">

      {/* Seat Selection Panel */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[18.57px] font-bold text-[#1A1A1A] font-inter">Choose Your Seat</h3>
          {selectedSeat && (
            <span className="text-xs font-bold text-[#FF2D1A] bg-red-50 border border-red-200 px-3.5 py-1 rounded-full flex items-center space-x-1.5">
              <span>Seat {selectedSeat}:</span>
              <strong className="text-black">{selectedSeatPrice === 0 ? "Free" : `+₹${selectedSeatPrice.toLocaleString()}`}</strong>
            </span>
          )}
        </div>

        {/* Legend row */}
        <div className="flex flex-wrap gap-6 text-[12px] font-medium text-[#6B6B6B] border-b border-[#EAEAEA] pb-4 mb-6 select-none font-inter">
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-gray-400"></span>
            <span>Taken / Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-[#FF2D1A]"></span>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-white border border-[#EAEAEA]"></span>
            <span>Standard (Free)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-[#DBEAFE] border border-[#93C5FD]"></span>
            <span>Window Seat</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-[#FEF3C7] border border-[#FCD34D]"></span>
            <span>Exit Row</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-emerald-50 border border-emerald-400"></span>
            <span>Preferred (+Fee)</span>
          </div>
        </div>

        {loadingSSR ? (
          <div className="py-16 text-center text-gray-500 font-medium text-sm space-y-2">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Fetching live airline seat map...</p>
          </div>
        ) : hasApiSeats ? (
          /* Visual aircraft cabin seat layout */
          <div className="border border-[#EAEAEA] rounded-2xl p-6 bg-gray-50/20 flex flex-col items-center select-none overflow-x-auto max-h-[520px] overflow-y-auto">

            {/* Cabin Cockpit flight nose cone dome */}
            <div className="w-[90px] h-[30px] border border-[#D0D0D0] bg-[#F0F0F0] rounded-t-full flex items-center justify-center mb-8 select-none flex-shrink-0">
              <Plane className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="space-y-3.5 min-w-[320px]">
              {/* Seat Column headers */}
              <div className="grid grid-cols-7 gap-3 text-center text-[11.25px] font-bold text-[#6B6B6B] mb-2 font-inter">
                <span>A</span>
                <span>B</span>
                <span>C</span>
                <span className="w-6"></span> {/* Aisle gap */}
                <span>D</span>
                <span>E</span>
                <span>F</span>
              </div>

              {/* Seat Rows mapping directly from API */}
              {apiRowNumbers.map((rowNo) => {
                const rowData = apiRowsMap[rowNo] || {};
                const colsLeft = ["A", "B", "C"];
                const colsRight = ["D", "E", "F"];

                return (
                  <div key={rowNo} className="grid grid-cols-7 gap-3 items-center text-center">
                    {/* Left Row Seats */}
                    {colsLeft.map((col) => {
                      const seatData = rowData[col];
                      const seatCode = seatData?.code || `${rowNo}${col}`;
                      const isTaken = seatData ? seatData.isTaken : false;
                      const price = seatData?.price || 0;

                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => handleSeatClick(seatCode, price, isTaken, seatData?.rawObj || null)}
                          className={`w-[36px] h-[32px] rounded-md text-[10.5px] border transition-all flex flex-col items-center justify-center select-none cursor-pointer relative ${getSeatStyles(seatCode, seatData)}`}
                          title={seatData ? `Seat ${seatCode}: ${price === 0 ? "Free" : "₹" + price}` : seatCode}
                        >
                          <span className="leading-tight">{col}</span>
                          {price > 0 && !isTaken && (
                            <span className="text-[7.5px] leading-none opacity-80 mt-0.5">₹{price}</span>
                          )}
                        </button>
                      );
                    })}

                    {/* Row Number (Center Aisle) */}
                    <span className="text-[11.25px] font-bold text-[#6B6B6B] w-6 select-none font-inter">{rowNo}</span>

                    {/* Right Row Seats */}
                    {colsRight.map((col) => {
                      const seatData = rowData[col];
                      const seatCode = seatData?.code || `${rowNo}${col}`;
                      const isTaken = seatData ? seatData.isTaken : false;
                      const price = seatData?.price || 0;

                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => handleSeatClick(seatCode, price, isTaken, seatData?.rawObj || null)}
                          className={`w-[36px] h-[32px] rounded-md text-[10.5px] border transition-all flex flex-col items-center justify-center select-none cursor-pointer relative ${getSeatStyles(seatCode, seatData)}`}
                          title={seatData ? `Seat ${seatCode}: ${price === 0 ? "Free" : "₹" + price}` : seatCode}
                        >
                          <span className="leading-tight">{col}</span>
                          {price > 0 && !isTaken && (
                            <span className="text-[7.5px] leading-none opacity-80 mt-0.5">₹{price}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Wing Divider */}
            <div className="flex items-center justify-center space-x-2.5 mt-7 w-full max-w-[360px] select-none font-inter">
              <div className="h-[1px] bg-[#D0D0D0] flex-grow"></div>
              <span className="text-[11.25px] font-medium text-[#6B6B6B] whitespace-nowrap">✈ Wing</span>
              <div className="h-[1px] bg-[#D0D0D0] flex-grow"></div>
            </div>

            <p className="text-[11.25px] text-[#6B6B6B] font-medium mt-6 text-center font-inter max-w-[428px]">
              Seat selection is optional. You can skip and get a free system-assigned seat at check-in.
            </p>

          </div>
        ) : (
          <div className="py-12 px-6 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-2">
            <p className="font-bold text-gray-800 text-sm">Free Seat Allocation at Airport Check-in</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Pre-booked seat assignment is not provided by the airline for this specific flight itinerary. Your seats will be automatically assigned at airport check-in at no extra charge.
            </p>
          </div>
        )}

      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full h-[60px] bg-[#FF2D1A] hover:bg-red-700 text-white font-semibold text-[18.57px] rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm select-none cursor-pointer active:scale-[0.99] font-inter"
      >
        <span>Continue</span>
        <svg className="w-[18.57px] h-[18.57px] text-white stroke-[3] fill-none" viewBox="0 0 24 24" stroke="currentColor">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  );
}
