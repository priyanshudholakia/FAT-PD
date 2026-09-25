/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingPersonalize.jsx
 * DESCRIPTION: Meals, add-ons, and travel insurance selector (Step 3).
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Utensils,
  Luggage,
  ShieldCheck,
  Check,
  Users
} from "lucide-react";

export default function BookingPersonalize({
  onContinue,
  onAddonsUpdate,
  ssrData,
  loadingSSR,
  passengers = []
}) {
  // Parse API Meals if available
  const apiMealItems = [];
  if (Array.isArray(ssrData?.MealDynamic)) {
    ssrData.MealDynamic.forEach(legMeals => {
      if (Array.isArray(legMeals)) {
        legMeals.forEach(meal => {
          if (meal.Code && meal.Code !== "NoMeal" && !apiMealItems.some(m => m.id === meal.Code)) {
            apiMealItems.push({
              id: meal.Code,
              label: meal.AirlineDescription || meal.Code,
              price: meal.Price || 0,
              emoji: "🍱",
              rawObj: meal
            });
          }
        });
      }
    });
  }

  // Parse API Baggage if available — grouped PER SEGMENT
  const baggageBySegment = [];
  if (Array.isArray(ssrData?.Baggage)) {
    ssrData.Baggage.forEach((segBaggage, segIndex) => {
      if (!Array.isArray(segBaggage) || segBaggage.length === 0) return;
      const items = [];
      segBaggage.forEach(bag => {
        if (bag?.Code && bag.Code !== "NoBaggage" && bag.Price > 0 && !items.some(b => b.id === bag.Code)) {
          items.push({
            id: bag.Code,
            label: bag.Text ? bag.Text.replace(/\n/g, ' ') : `Extra Baggage ${bag.Weight} KG`,
            price: bag.Price || 0,
            desc: `Add extra baggage (${bag.Weight} KG)`,
            badge: bag.Weight >= 15 ? "Popular" : null,
            rawObj: bag
          });
        }
      });
      if (items.length > 0) {
        baggageBySegment.push({
          segmentIndex: segIndex,
          origin: segBaggage[0]?.Origin,
          destination: segBaggage[0]?.Destination,
          items
        });
      }
    });
  }

  const activeMealsList = apiMealItems.length > 0
    ? [{ id: "none", label: "No Meal Preference", price: 0, emoji: "—" }, ...apiMealItems]
    : [];

  // Eligible passengers for personalized add-ons (Adults and Children; infants travel on lap)
  const eligiblePassengers = useMemo(() => {
    if (Array.isArray(passengers) && passengers.length > 0) {
      const list = passengers
        .map((p, originalIndex) => {
          const name = `${p?.firstName || p?.FirstName || ""} ${p?.lastName || p?.LastName || ""}`.trim();
          const pType = p?.paxType || p?.PaxType || 1;
          return {
            ...p,
            originalIndex,
            displayName: name || `Passenger ${originalIndex + 1}`,
            typeLabel: pType === 2 ? "Child" : (pType === 3 ? "Infant" : "Adult"),
            paxType: pType
          };
        })
        .filter((p) => p.paxType !== 3);
      return list.length > 0 ? list : [{ originalIndex: 0, displayName: "Passenger 1", typeLabel: "Adult", paxType: 1 }];
    }
    return [{ originalIndex: 0, displayName: "Passenger 1", typeLabel: "Adult", paxType: 1 }];
  }, [passengers]);

  const [activePaxIndex, setActivePaxIndex] = useState(() => eligiblePassengers[0]?.originalIndex || 0);
  const activePax = eligiblePassengers.find((p) => p.originalIndex === activePaxIndex) || eligiblePassengers[0];

  // Per-passenger selections:
  // selectedMealsByPax: { [originalIndex]: mealId }
  // selectedAddonsByPax: { [originalIndex]: { [segmentIndex]: addonId } }
  const [selectedMealsByPax, setSelectedMealsByPax] = useState({});
  const [selectedAddonsByPax, setSelectedAddonsByPax] = useState({});
  const [isInsuranceAdded, setIsInsuranceAdded] = useState(false);

  const currentPaxMeal = selectedMealsByPax[activePax.originalIndex] || "none";
  const currentPaxAddons = selectedAddonsByPax[activePax.originalIndex] || {};

  const handleMealSelect = (mealId) => {
    const updatedMeals = {
      ...selectedMealsByPax,
      [activePax.originalIndex]: mealId
    };
    setSelectedMealsByPax(updatedMeals);
    triggerPriceUpdate(updatedMeals, selectedAddonsByPax, isInsuranceAdded);
  };

  const handleAddonClick = (segmentIndex, addonId) => {
    const currentForPax = { ...(selectedAddonsByPax[activePax.originalIndex] || {}) };
    if (currentForPax[segmentIndex] === addonId) {
      delete currentForPax[segmentIndex];
    } else {
      currentForPax[segmentIndex] = addonId;
    }
    const updatedAddons = {
      ...selectedAddonsByPax,
      [activePax.originalIndex]: currentForPax
    };
    setSelectedAddonsByPax(updatedAddons);
    triggerPriceUpdate(selectedMealsByPax, updatedAddons, isInsuranceAdded);
  };

  const handleInsuranceClick = () => {
    const updated = !isInsuranceAdded;
    setIsInsuranceAdded(updated);
    triggerPriceUpdate(selectedMealsByPax, selectedAddonsByPax, updated);
  };

  const triggerPriceUpdate = (mealsMap, addonsMap, insurance) => {
    let totalMealsPrice = 0;
    let totalBaggagePrice = 0;
    const addonsByPax = {};

    eligiblePassengers.forEach((p) => {
      const pIdx = p.originalIndex;
      const mealId = mealsMap[pIdx] || "none";
      const mealObj = activeMealsList.find((m) => m.id === mealId);
      if (mealObj && mealObj.price > 0) {
        totalMealsPrice += mealObj.price;
      }

      const paxAddonsSelection = addonsMap[pIdx] || {};
      const paxAddonObjs = baggageBySegment
        .map(({ segmentIndex, items }) => {
          const chosenId = paxAddonsSelection[segmentIndex];
          return chosenId ? items.find((it) => it.id === chosenId) : null;
        })
        .filter(Boolean);

      paxAddonObjs.forEach((item) => {
        totalBaggagePrice += item.price || 0;
      });

      addonsByPax[pIdx] = {
        meal: mealId,
        mealObj: mealObj?.rawObj || null,
        addons: paxAddonsSelection,
        addonObjs: paxAddonObjs.map((it) => it.rawObj).filter(Boolean)
      };
    });

    const insurancePrice = insurance ? 149 : 0;
    const totalAdditional = totalMealsPrice + totalBaggagePrice + insurancePrice;

    const leadPaxIdx = eligiblePassengers[0].originalIndex;
    const leadAddons = addonsByPax[leadPaxIdx] || {};

    onAddonsUpdate({
      addonsByPax,
      // Backward compatibility for single passenger flow:
      meal: leadAddons.meal || "none",
      mealObj: leadAddons.mealObj || null,
      addons: leadAddons.addons || {},
      addonObjs: leadAddons.addonObjs || [],
      insurance,
      totalAdditional
    });
  };

  return (
    <div className="space-y-6 font-inter text-left">

      {/* Multi-Passenger Switcher Bar */}
      {eligiblePassengers.length > 1 && (
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[24px] shadow-2xs font-inter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-[14px] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF2D1A]" />
              <span>Select Traveller to Customize Meals &amp; Baggage:</span>
            </h4>
            <span className="text-xs font-semibold text-[#64748B]">
              Active: <strong className="text-black">{activePax.displayName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {eligiblePassengers.map((p, idx) => {
              const isActive = p.originalIndex === activePax.originalIndex;
              const pMealId = selectedMealsByPax[p.originalIndex];
              const pMealObj = activeMealsList.find((m) => m.id === pMealId && m.id !== "none");
              const pAddons = selectedAddonsByPax[p.originalIndex] || {};
              const pAddonCount = Object.keys(pAddons).length;

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

                  <div className="text-right flex-shrink-0 text-[10px] font-medium text-gray-500 space-y-0.5">
                    {pMealObj ? (
                      <span className="bg-red-100 text-[#FF2D1A] font-bold px-1.5 py-0.5 rounded block truncate max-w-[110px]">
                        🍱 {pMealObj.label}
                      </span>
                    ) : (
                      <span className="text-gray-400 block">No meal</span>
                    )}
                    {pAddonCount > 0 ? (
                      <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded block">
                        🧳 {pAddonCount} Bag add-on
                      </span>
                    ) : (
                      <span className="text-gray-400 block">Free bag</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Meal Preferences Card */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 select-none">
          <div>
            <h3 className="text-[18.57px] font-bold text-[#1A1A1A] flex items-center space-x-2 font-inter">
              <Utensils className="w-4.5 h-4.5 text-gray-400" />
              <span>Meal Preference</span>
              <span className="text-[11.25px] text-[#6B6B6B] font-medium bg-[#F0F0F0] px-2.5 py-0.5 rounded-full ml-2">
                Pre-order &amp; save
              </span>
            </h3>
            <p className="text-[12.5px] text-[#64748B] mt-0.5">
              Selecting meal for: <strong className="text-black">{activePax.displayName}</strong> ({activePax.typeLabel})
            </p>
          </div>
        </div>

        {loadingSSR ? (
          <div className="py-8 text-center text-gray-500 font-medium text-xs space-y-2">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading meal options from airline...</p>
          </div>
        ) : activeMealsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[11px]">
            {activeMealsList.map((meal) => {
              const isSelected = currentPaxMeal === meal.id;
              return (
                <button
                  type="button"
                  key={meal.id}
                  onClick={() => handleMealSelect(meal.id)}
                  className={`border rounded-lg p-[13.125px] min-h-[58px] text-left cursor-pointer transition-all flex items-center justify-between font-inter ${isSelected
                    ? "border-[#FF2D1A] bg-[#FFF5F4]"
                    : "border-[#EAEAEA] hover:border-gray-300 bg-white"
                    }`}
                >
                  <div className="flex items-center space-x-[11.25px] select-none overflow-hidden pr-2">
                    <span className="text-[18.75px] leading-none flex-shrink-0">{meal.emoji || "🍱"}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11.25px] font-bold text-[#333333] leading-normal line-clamp-2">{meal.label}</span>
                      <span className="text-[11.25px] font-medium text-[#6B6B6B] leading-none mt-0.5">
                        {meal.price === 0 ? "Free" : `+₹${meal.price}`}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-[16px] h-[16px] text-[#FF2D1A] stroke-[3] ml-2 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
            Pre-booked meal options are not offered by the airline for this specific flight route. In-flight purchase may be available.
          </p>
        )}
      </div>

      {/* 2. Add-on Services Card — grouped per segment */}
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-[32px] shadow-2xs font-inter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 select-none font-inter">
          <div>
            <h3 className="text-[18.57px] font-bold text-[#1A1A1A] flex items-center space-x-2 font-inter">
              <Luggage className="w-4.5 h-4.5 text-gray-400" />
              <span>Add-on Baggage</span>
            </h3>
            <p className="text-[12.5px] text-[#64748B] mt-0.5">
              Selecting baggage for: <strong className="text-black">{activePax.displayName}</strong> ({activePax.typeLabel})
            </p>
          </div>
        </div>

        {loadingSSR ? (
          <div className="py-8 text-center text-gray-500 font-medium text-xs space-y-2">
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading baggage add-ons from airline...</p>
          </div>
        ) : baggageBySegment.length > 0 ? (
          <div className="space-y-6">
            {baggageBySegment.map(({ segmentIndex, origin, destination, items }) => (
              <div key={segmentIndex}>
                {baggageBySegment.length > 1 && (origin || destination) && (
                  <p className="text-[11.25px] font-bold uppercase tracking-wide text-[#7E7E7E] mb-2.5">
                    {origin} → {destination} — choose one
                  </p>
                )}
                <div className="space-y-[11.25px]">
                  {items.map((addon) => {
                    const isAdded = currentPaxAddons[segmentIndex] === addon.id;
                    return (
                      <div
                        key={addon.id}
                        className={`border rounded-xl p-[15px] min-h-[70px] flex items-center justify-between gap-4 bg-white font-inter transition-all ${isAdded ? "border-[#FF2D1A] bg-[#FFF5F4]" : "border-[#D0D0D0]"
                          }`}
                      >

                        {/* Left Visual Icon + Description */}
                        <div className="flex items-center space-x-[11.25px]">
                          <div className="w-[38px] h-[38px] rounded-lg bg-[#FFD9D9] flex items-center justify-center flex-shrink-0 select-none">
                            <Luggage className="w-[18px] h-[18px] text-[#FF2D1A]" />
                          </div>

                          <div className="text-left select-none">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-[13.125px] text-[#1A1A1A]">{addon.label}</h4>
                              {addon.badge && (
                                <span className="bg-[#F0F0F0] text-[#6B6B6B] text-[11.25px] font-bold px-2.5 py-0.5 rounded-full">
                                  {addon.badge}
                                </span>
                              )}
                            </div>
                            {addon.desc && <p className="text-[11.25px] text-[#6B6B6B] font-medium mt-0.5">{addon.desc}</p>}
                          </div>
                        </div>

                        {/* Right price and action */}
                        <div className="flex items-center space-x-[11.25px] flex-shrink-0">
                          <span className="text-[13.125px] font-bold text-[#1A1A1A]">+₹{addon.price}</span>
                          <button
                            type="button"
                            onClick={() => handleAddonClick(segmentIndex, addon.id)}
                            className={`text-[11.25px] font-bold rounded-[13.375px] cursor-pointer h-[28px] w-[63px] flex items-center justify-center border transition-all whitespace-nowrap ${isAdded
                              ? "bg-[#FF2D1A] border-[#FF2D1A] text-white"
                              : "bg-[#FFEFEF] border-[#FF8484] hover:bg-[#FFE5E5] text-[#E53935]"
                              }`}
                          >
                            {isAdded ? "Added" : "+ Add"}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-[#9A9A9A] font-medium">
              You can select at most one extra baggage option per passenger per flight.
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
            No extra check-in baggage add-ons available for pre-purchase from the airline for this fare class.
          </p>
        )}
      </div>

      {/* Continue CTA */}
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