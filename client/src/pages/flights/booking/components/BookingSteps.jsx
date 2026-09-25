/**
 * ============================================================================
 * PATH: client/src/pages/flights/booking/components/BookingSteps.jsx
 * DESCRIPTION: Stepper progress tracker using icons and segmented lines.
 * ============================================================================
 */

import React from "react";
import { Check, User, MapPin, Star, CreditCard } from "lucide-react";

export default function BookingSteps({ currentStep }) {
  const steps = [
    { id: 1, label: "Fill Your Info", icon: <User className="w-4 h-4" /> },
    { id: 2, label: "Choose Seat", icon: <MapPin className="w-4 h-4" /> },
    { id: 3, label: "Personalize Trip", icon: <Star className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 shadow-2xs font-sans select-none relative w-full">

      {/* 
        Segmented progress connection line 
        - Left & Right: 24px (container padding) + 60px (half of 120px step width) = 84px
        - Top: 16px (container padding) + 18px (half of 36px circle height) = 34px
      */}
      <div className="absolute left-[84px] right-[84px] top-[34px] h-[2.5px] z-0 flex pointer-events-none">
        {/* Segment 1: Step 1 to 2 */}
        <div className={`h-full flex-1 transition-colors duration-500 ${currentStep > 1 ? "bg-emerald-500" : "bg-gray-200"}`}></div>
        {/* Segment 2: Step 2 to 3 */}
        <div className={`h-full flex-1 transition-colors duration-500 ${currentStep > 2 ? "bg-emerald-500" : "bg-gray-200"}`}></div>
      </div>

      {/* Steps Flex Row */}
      <div className="flex items-start justify-between w-full relative">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center w-[120px] text-center z-10">

              {/* Step indicator circle with solid background to mask the connector line */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border-2 select-none ${isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : isActive
                      ? "bg-[#FF2D1A] border-[#FF2D1A] text-white shadow-md scale-105"
                      : "bg-white border-gray-200 text-[#6B6B6B]"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Text Label */}
              <span className={`text-[11.25px] font-bold font-quicksand tracking-wide block mt-2 transition-colors ${isActive ? "text-[#FF2D1A]" : isCompleted ? "text-emerald-600" : "text-[#6B6B6B]"
                }`}>
                {step.label}
              </span>

            </div>
          );
        })}
      </div>

    </div>
  );
}

