/**
 * ============================================================================
 * PATH: client/src/pages/home/components/WhyChooseUs.jsx
 * DESCRIPTION: Redesigned service guarantees and core brand trust highlights
 *              matching Figma styles exactly.
 * ============================================================================
 */

import React from "react";
import { Tag, Layers, ShieldCheck, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  const highlights = [
    {
      title: "Best Price Guarantee",
      desc: "We compare 500+ airlines, hotels & travel partners to bring you the lowest fares.",
      icon: Tag,
      color: "#4CAF50",
      bgColor: "#E8F5E9"
    },
    {
      title: "Complete Travel Platform",
      desc: "Flights, hotels, trains, cabs and holiday packages - all in one place.",
      icon: Layers,
      color: "#2196F3",
      bgColor: "#E3F2FD"
    },
    {
      title: "Secure & Trusted",
      desc: "PCI DSS Level 1 certified payments. Your data is 100% safe with us.",
      icon: ShieldCheck,
      color: "#009688",
      bgColor: "#E0F2F1"
    },
    {
      title: "24/7 Customer Support",
      desc: "Our travel experts are available anytime you need us.",
      icon: Headphones,
      color: "#FF9800",
      bgColor: "#FFF3E0"
    }
  ];

  return (
    <section className="bg-white py-14 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Header Block */}
        <div className="text-left mb-8">
          <h2 className="text-[32px] font-bold font-satoshi text-[#1A1A1A] tracking-tight">Why Choose FlyAnyTrip?</h2>
        </div>

        {/* 4-Column Left-Aligned Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200/70 p-6.5 rounded-2xl text-left shadow-xs flex flex-col items-start transition-all duration-300 hover:shadow-md hover:border-gray-300"
            >
              {/* Icon Container */}
              <div 
                className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: item.bgColor }}
              >
                <item.icon className="w-5.5 h-5.5" style={{ color: item.color }} />
              </div>

              {/* Title */}
              <h3 className="font-bold font-quicksand text-[18px] text-[#1A1A1A] tracking-tight">{item.title}</h3>

              {/* Subtext */}
              <p className="font-inter text-[12px] font-normal text-[#666666] mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
