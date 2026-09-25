/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/FareSummary.jsx
 * DESCRIPTION: Dedicated live fare summary card. Shows a full per-traveller
 * price breakdown (Adult x N / Child x N / Infant x N + Total Taxes +
 * Grand Total) sourced directly from Adivaha's FareBreakdown array, matching
 * the "Price Summary" panel pattern used by EaseMyTrip and other OTAs.
 * ============================================================================
 */

import React from "react";

export default function FareSummary({
  // Preferred: pass `breakdown` (array of { label, count, amount } — one row
  // per PassengerType) plus `taxesTotal` for the full itemised view.
  breakdown,
  taxesTotal,
  // Legacy/simple props, used as a fallback when no breakdown is available
  // (e.g. a fare option without a FareBreakdown array).
  basePrice,
  taxes,
  additionalAmount,
  totalAmount,
  discount,
  promoCode
}) {
  const hasBreakdown = Array.isArray(breakdown) && breakdown.length > 0;
  const effectiveTaxes = hasBreakdown ? taxesTotal : taxes;

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-2xs text-left font-inter select-none">
      <h3 className="text-[18.57px] font-bold text-[#1A1A1A] mb-1 font-inter">Fare Summary</h3>
      <p className="text-[15.09px] text-[#666666] font-normal mb-5 font-inter">
        {hasBreakdown ? "Live-updating price breakdown" : "Live-updating fare details"}
      </p>

      <div className="space-y-4 text-[16.25px] font-normal text-[#333333]">
        {hasBreakdown ? (
          // Full per-traveller breakdown: Adult x N, Child x N, Infant x N —
          // each row is the BASE fare total for that passenger type, sourced
          // straight from Adivaha's FareBreakdown[].BaseFare. Taxes are
          // rolled up into a single "Total Taxes" row below, exactly like
          // EaseMyTrip's Price Summary panel.
          breakdown.map((row) => (
            <div key={row.type} className="flex justify-between items-center">
              <span className="font-inter">
                {row.label} x {row.count}
              </span>
              <span className="font-inter">₹{Math.round(row.totalBase).toLocaleString()}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between items-center">
            <span className="font-inter">Base Fare</span>
            <span className="font-inter">₹{Math.round(basePrice || 0).toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-inter">Total Taxes &amp; Fees</span>
          <span className="font-inter">₹{Math.round(effectiveTaxes || 0).toLocaleString()}</span>
        </div>

        {/* Render extra add-ons only if they are positive */}
        {additionalAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="font-semibold">Add-on Services</span>
            <span>+₹{Math.round(additionalAmount).toLocaleString()}</span>
          </div>
        )}

        {/* Render promo code only if it is positive */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 text-sm font-semibold">
            <span>Promo ({promoCode})</span>
            <span className="font-bold">-₹{Math.round(discount).toLocaleString()}</span>
          </div>
        )}

        <div className="border-t border-[#EAEAEA] pt-4.5 flex justify-between items-center text-[20.90px] font-bold text-[#1A1A1A] mt-5">
          <span className="font-inter">Grand Total</span>
          <span className="font-inter">₹{Math.round(totalAmount || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
