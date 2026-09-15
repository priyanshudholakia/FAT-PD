/**
 * ============================================================================
 * PATH: client/src/pages/home/components/PopularRoutes.jsx
 * DESCRIPTION: Redesigned popular routes grid matching Figma layout exactly.
 * ============================================================================
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PopularRoutes() {
  const navigate = useNavigate();

  const routes = [
    {
      from: "DEL",
      to: "BOM",
      price: "₹3,499",
      tag: "Popular",
      image: "/assets/home/routes/images/DEL.webp"
    },
    {
      from: "BLR",
      to: "GOI",
      price: "₹2,799",
      tag: "Deal",
      image: "/assets/home/routes/images/BLR.webp"
    },
    {
      from: "BOM",
      to: "DXB",
      price: "₹12,799",
      tag: "Intl",
      image: "/assets/home/routes/images/BOM.webp"
    },
    {
      from: "DEL",
      to: "SIN",
      price: "₹8,499",
      tag: "Intl",
      image: "/assets/home/routes/images/SIN.webp"
    },
    {
      from: "HYD",
      to: "BLR",
      price: "₹1,799",
      tag: "Budget",
      image: "/assets/home/routes/images/HYD.webp"
    },
    {
      from: "MAA",
      to: "CCU",
      price: "₹4,799",
      tag: "Route",
      image: "/assets/home/routes/images/CCU.webp"
    }
  ];

  return (
    <section className="bg-white py-14 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Header Block */}
        <div className="flex justify-between items-end mb-8">
          <div className="text-left">
            <h2 className="text-[32px] font-bold font-satoshi text-[#1A1A1A] tracking-tight">Popular Flight Routes</h2>
            <p className="text-[#6B6B6B] text-[16px] font-medium font-quicksand mt-1">Best fares across 500+ airlines</p>
          </div>
          <Link to="/flights" className="text-[#6B6B6B] hover:text-[#FF2D1A] text-[14px] font-semibold font-quicksand transition-colors flex items-center space-x-1">
            <span>View All Routes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Column Route Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((route, i) => (
            <div
              key={i}
              onClick={() => navigate("/flights")}
              className="flex bg-white border border-gray-200/60 hover:border-gray-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer h-28"
            >
              {/* Left Image Section */}
              <div className="w-[33%] h-full">
                <img
                  src={route.image}
                  alt={`${route.from} to ${route.to}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right Content Section */}
              <div className="w-[67%] p-4 flex flex-col justify-between text-left">

                {/* Header Row: Codes and Tag Pill side-by-side */}
                <div className="flex justify-between items-center w-full font-satoshi">
                  <h4 className="text-[18px] font-medium text-[#1A1A1A] flex items-center">
                    <span>{route.from}</span>
                    <img src="/assets/home/routes/icons/swap.svg" alt="swap" className="w-[21px] h-[16px] mx-2 flex-shrink-0" />
                    <span>{route.to}</span>
                  </h4>

                  {/* Tag Pill with rounded-md and soft pink/red theme */}
                  <span className="bg-[#FFF1F2] text-[#FF2D1A] text-[11px] font-normal uppercase px-2 py-0.5 rounded-md tracking-wider">
                    {route.tag}
                  </span>
                </div>

                {/* Price block */}
                <div className="font-satoshi">
                  <span className="text-[20px] font-bold text-[#1A1A1A] block leading-tight">{route.price}</span>
                  <span className="text-[12.86px] text-[#6B6B6B] font-normal block mt-0.5">Starting from</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
