import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export default function BookingPayment({
  flight,
  selectedFare,
  totalAmount,
  onPay,
  selectedSeat,
  addonsData,
  basePrice,
  taxes
}) {
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const getMealLabel = (mealId) => {
    switch (mealId) {
      case "veg": return "Vegetarian";
      case "nonveg": return "Non-Vegetarian";
      case "vegan": return "Vegan";
      case "jain": return "Jain";
      default: return "No Preference";
    }
  };

  return (
    <div className="space-y-6 font-inter text-left">

      {/* Review details Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
        <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-5 flex items-center space-x-2 font-inter select-none">
          <ShieldCheck className="w-[18px] h-[18px] text-[#10B981] flex-shrink-0" />
          <span>Booking Summary</span>
        </h3>

        <div className="space-y-5 text-sm font-bold text-[#1A1A1A] font-inter">
          {/* Flight */}
          <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
            <span className="text-[#6B6B6B] font-bold text-[14px]">Flight</span>
            <div className="text-right flex flex-col items-end">
              <span className="text-[#1A1A1A] font-bold text-[14px]">
                {flight.airline} {flight.code} · {flight.fromCode} → {flight.toCode} · {formatDate(flight.rawOption?.Segments?.[0]?.[0]?.Origin?.DepTime)}
              </span>
              <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                {flight.depTime} – {flight.arrTime} · {flight.stops} · {flight.duration}
              </span>
            </div>
          </div>

          {/* Passenger */}
          <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
            <span className="text-[#6B6B6B] font-bold text-[14px]">Passenger</span>
            <div className="text-right flex flex-col items-end">
              <span className="text-[#1A1A1A] font-bold text-[14px]">
                1 Adult · {selectedFare.title || "Economy Value"}
              </span>
              <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                Seat: {selectedSeat || "System assigned (free)"}
              </span>
            </div>
          </div>

          {/* Meal */}
          <div className="flex justify-between items-start py-3 border-b border-[#EAEAEA]">
            <span className="text-[#6B6B6B] font-bold text-[14px]">Meal</span>
            <div className="text-right flex flex-col items-end">
              <span className="text-[#1A1A1A] font-bold text-[14px]">
                {getMealLabel(addonsData?.meal)}
              </span>
              <span className="text-[12px] text-[#6B6B6B] font-medium mt-1">
                {addonsData?.meal && addonsData.meal !== "none" ? "Pre-ordered" : "No extra charge"}
              </span>
            </div>
          </div>

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

        </div>
      </div>

      {/* Pay CTA Button */}
      <button
        type="button"
        onClick={onPay}
        className="w-full h-[60px] bg-[#FF2D1A] hover:bg-red-700 text-white font-semibold text-[18.57px] rounded-xl transition-all flex items-center justify-center space-x-3 shadow-sm select-none cursor-pointer active:scale-[0.99] font-inter"
      >
        <Lock className="w-[18.57px] h-[18.57px] text-white stroke-[3]" />
        <span>Pay ₹{totalAmount.toLocaleString()} Securely</span>
        <svg className="w-[18.57px] h-[18.57px] text-white stroke-[3] fill-none" viewBox="0 0 24 24" stroke="currentColor">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

    </div>
  );
}
