/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingSeat.jsx
 * DESCRIPTION: Interactive flight seat map selector console (Step 2).
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import { Plane, Users } from "lucide-react";

export default function BookingSeat({
  onContinue,
  onSeatSelect,
  onSeatPriceSelect,
  ssrData,
  loadingSSR,
  passengers = []
}) {
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

  // Filter passengers who are eligible for their own seat:
  // Under IATA guidelines, Adults (PaxType 1) and Children (PaxType 2) occupy a seat.
  // Infants (PaxType 3) travel on an adult's lap and do not get an individual seat.
  const seatEligiblePassengers = useMemo(() => {
    if (Array.isArray(passengers) && passengers.length > 0) {
      const eligible = passengers
        .map((p, originalIndex) => {
          const name = `${p?.firstName || p?.FirstName || ""} ${p?.lastName || p?.LastName || ""}`.trim();
          const pType = p?.paxType || p?.PaxType || 1;
          return {
            ...p,
            originalIndex,
            displayName: name || `Passenger ${originalIndex + 1}`,
            typeLabel: pType === 2 ? "Child" : "Adult",
            paxType: pType
          };
        })
        .filter((p) => p.paxType !== 3);
      return eligible.length > 0 ? eligible : [{ originalIndex: 0, displayName: "Passenger 1", typeLabel: "Adult", paxType: 1 }];
    }
    return [{ originalIndex: 0, displayName: "Passenger 1", typeLabel: "Adult", paxType: 1 }];
  }, [passengers]);

  const [activePaxIndex, setActivePaxIndex] = useState(() => seatEligiblePassengers[0]?.originalIndex || 0);
  const [selectedSeatsByPax, setSelectedSeatsByPax] = useState({});

  const activePax = seatEligiblePassengers.find((p) => p.originalIndex === activePaxIndex) || seatEligiblePassengers[0];

  const handleSeatClick = (seatCode, price = 0, isTaken = false, rawObj = null) => {
    if (isTaken) return;

    const updated = { ...selectedSeatsByPax };
    const occupyingIdx = Object.keys(updated).find((idx) => updated[idx]?.seatCode === seatCode);

    if (occupyingIdx !== undefined) {
      if (Number(occupyingIdx) === activePax.originalIndex) {
        // Deselect seat for current active passenger
        delete updated[activePax.originalIndex];
      } else {
        // Switch seat ownership to current active passenger
        delete updated[occupyingIdx];
        updated[activePax.originalIndex] = { seatCode, price, rawObj };
      }
    } else {
      // Assign seat to current active passenger
      updated[activePax.originalIndex] = { seatCode, price, rawObj };

      // Auto-advance to the next passenger without an assigned seat for rapid selection
      const nextUnassigned = seatEligiblePassengers.find(
        (p) => p.originalIndex !== activePax.originalIndex && !updated[p.originalIndex]
      );
      if (nextUnassigned) {
        setActivePaxIndex(nextUnassigned.originalIndex);
      }
    }

    setSelectedSeatsByPax(updated);

    const totalSeatPrice = Object.values(updated).reduce((sum, item) => sum + (item?.price || 0), 0);

    if (onSeatSelect) {
      onSeatSelect(updated, totalSeatPrice);
    }
    if (onSeatPriceSelect) {
      onSeatPriceSelect(totalSeatPrice);
    }
  };

  const getSeatStyles = (seatCode, seatData) => {
    const isSelectedByActive = selectedSeatsByPax[activePax.originalIndex]?.seatCode === seatCode;
    if (isSelectedByActive) {
      return "bg-[#FF2D1A] border-[#FF2D1A] text-white font-black shadow-md scale-110 z-10 ring-2 ring-red-300";
    }

    const otherOccupantIdx = Object.keys(selectedSeatsByPax).find(
      (idx) => Number(idx) !== activePax.originalIndex && selectedSeatsByPax[idx]?.seatCode === seatCode
    );
    if (otherOccupantIdx !== undefined) {
      return "bg-[#4F46E5] border-[#4338CA] text-white font-black shadow-sm z-10 ring-2 ring-indigo-200";
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

  const totalSeatsCount = Object.keys(selectedSeatsByPax).length;
  const totalSeatPrice = Object.values(selectedSeatsByPax).reduce((sum, item) => sum + (item?.price || 0), 0);

  return (
    <div className="space-y-6 font-inter text-left">

      {/* Seat Selection Panel */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-[18.57px] font-bold text-[#1A1A1A] font-inter">Choose Your Seats</h3>
            <p className="text-[13px] text-[#64748B]">
              Assigning seat for: <strong className="text-black">{activePax.displayName}</strong> ({activePax.typeLabel})
            </p>
          </div>
          {totalSeatsCount > 0 ? (
            <span className="text-xs font-bold text-[#FF2D1A] bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 self-start sm:self-auto">
              <span>{totalSeatsCount} Seat{totalSeatsCount > 1 ? "s" : ""} Assigned:</span>
              <strong className="text-black">{totalSeatPrice === 0 ? "Free" : `+₹${totalSeatPrice.toLocaleString()}`}</strong>
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              Free Allocation at Check-in
            </span>
          )}
        </div>

        {/* Multi-Passenger Switcher Bar */}
        {seatEligiblePassengers.length > 1 && (
          <div className="mb-6 pb-6 border-b border-[#EAEAEA]">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Select passenger to choose seat:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {seatEligiblePassengers.map((p, idx) => {
                const isActive = p.originalIndex === activePax.originalIndex;
                const assigned = selectedSeatsByPax[p.originalIndex];
                return (
                  <button
                    type="button"
                    key={p.originalIndex}
                    onClick={() => setActivePaxIndex(p.originalIndex)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? "border-[#FF2D1A] bg-red-50/60 ring-2 ring-red-400/50 shadow-xs"
                        : "border-[#E2E8F0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive ? "bg-[#FF2D1A] text-white" : "bg-gray-200 text-gray-700"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[13px] text-[#1E293B] truncate block">
                          {p.displayName}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B] pl-6.5 block">
                        {p.typeLabel}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {assigned ? (
                        <span className="text-[11px] font-extrabold text-[#FF2D1A] bg-red-100/80 px-2 py-0.5 rounded-md block">
                          Seat {assigned.seatCode}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md block">
                          No seat
                        </span>
                      )}
                      {assigned?.price > 0 && (
                        <span className="text-[10px] font-bold text-gray-500 block mt-0.5">
                          +₹{assigned.price}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Legend row */}
        <div className="flex flex-wrap gap-5 text-[12px] font-medium text-[#6B6B6B] border-b border-[#EAEAEA] pb-4 mb-6 select-none font-inter">
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-gray-400"></span>
            <span>Taken / Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-[16px] h-[16px] rounded bg-[#FF2D1A]"></span>
            <span>Selected ({activePax.displayName.split(" ")[0]})</span>
          </div>
          {seatEligiblePassengers.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="w-[16px] h-[16px] rounded bg-[#4F46E5]"></span>
              <span>Other Travellers</span>
            </div>
          )}
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

                      // Check if another passenger in our group holds this seat
                      const otherOccupant = Object.keys(selectedSeatsByPax).find(
                        (idx) => Number(idx) !== activePax.originalIndex && selectedSeatsByPax[idx]?.seatCode === seatCode
                      );
                      const otherPaxLabel = otherOccupant !== undefined
                        ? `P${seatEligiblePassengers.findIndex(p => p.originalIndex === Number(otherOccupant)) + 1}`
                        : null;

                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => handleSeatClick(seatCode, price, isTaken, seatData?.rawObj || null)}
                          className={`w-[36px] h-[32px] rounded-md text-[10.5px] border transition-all flex flex-col items-center justify-center select-none cursor-pointer relative ${getSeatStyles(seatCode, seatData)}`}
                          title={seatData ? `Seat ${seatCode}: ${price === 0 ? "Free" : "₹" + price}` : seatCode}
                        >
                          <span className="leading-tight">{otherPaxLabel || col}</span>
                          {price > 0 && !isTaken && !otherPaxLabel && (
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

                      const otherOccupant = Object.keys(selectedSeatsByPax).find(
                        (idx) => Number(idx) !== activePax.originalIndex && selectedSeatsByPax[idx]?.seatCode === seatCode
                      );
                      const otherPaxLabel = otherOccupant !== undefined
                        ? `P${seatEligiblePassengers.findIndex(p => p.originalIndex === Number(otherOccupant)) + 1}`
                        : null;

                      return (
                        <button
                          type="button"
                          key={col}
                          onClick={() => handleSeatClick(seatCode, price, isTaken, seatData?.rawObj || null)}
                          className={`w-[36px] h-[32px] rounded-md text-[10.5px] border transition-all flex flex-col items-center justify-center select-none cursor-pointer relative ${getSeatStyles(seatCode, seatData)}`}
                          title={seatData ? `Seat ${seatCode}: ${price === 0 ? "Free" : "₹" + price}` : seatCode}
                        >
                          <span className="leading-tight">{otherPaxLabel || col}</span>
                          {price > 0 && !isTaken && !otherPaxLabel && (
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
