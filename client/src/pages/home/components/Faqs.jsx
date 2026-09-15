/**
 * ============================================================================
 * PATH: client/src/pages/home/components/Faqs.jsx
 * DESCRIPTION: Redesigned FAQ accordion matching the Figma layout exactly.
 * ============================================================================
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Faqs() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "What travel services does FlyAnyTrip offer?",
      a: "We offer flight bookings, hotel reservations, train tickets, bus tickets, car rentals, curated tour packages, and holiday deals - all on one platform."
    },
    {
      q: "How do I cancel or modify a booking?",
      a: "You can easily modify or cancel your bookings directly through the 'My Bookings' tab in your dashboard, or by contacting our customer support hotline."
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, all payments are fully encrypted and securely processed using industry-standard SSL protection and PCI-DSS compliant payment gateways."
    },
    {
      q: "Do you offer group travel or corporate packages?",
      a: "Yes, we customize flight and holiday packages for corporate clients and large tour groups. Please reach out to our Corporate Travel desk for bookings."
    }
  ];

  return (
    <section className="bg-white py-16 font-sans">
      <div className="max-w-4xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-[34px] font-bold font-satoshi text-[#1A1A1A] tracking-tight text-center mb-8">
          Frequently Asked Questions
        </h2>

        {/* Accordions grouped inside a single container box */}
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`transition-colors border-b border-gray-200/60 last:border-b-0 ${isOpen ? "bg-[#FFF1F2]/40" : "bg-white"
                  }`}
              >
                {/* Question Row Header */}
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full px-6 py-5 text-left font-medium font-satoshi text-[24px] text-[#1A1A1A] flex justify-between items-center transition-colors"
                >
                  <span className="pr-4 leading-tight">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Answer Box Panel */}
                {isOpen && (
                  <div className="px-6 pb-6 font-satoshi text-[16px] font-normal text-[#272727] leading-relaxed text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
