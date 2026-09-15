/**
 * ============================================================================
 * PATH: client/src/pages/home/components/PopularDestinations.jsx
 * DESCRIPTION: Redesigned popular destinations grid matching Figma layout exactly.
 * ============================================================================
 */

import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PopularDestinations() {
  const destinations = [
    {
      title: "Goa",
      duration: "3N/4D per person",
      price: "₹8,999",
      tag: "Beach",
      image: "/assets/home/destinations/images/goa.webp",
      span: "md:col-span-1"
    },
    {
      title: "Manali",
      duration: "5N/6D per person",
      price: "₹12,499",
      tag: "Hills",
      image: "/assets/home/destinations/images/manali.webp",
      span: "md:col-span-2"
    },
    {
      title: "Kerala",
      duration: "6N/7D per person",
      price: "₹14,999",
      tag: "Nature",
      image: "/assets/home/destinations/images/kerala.webp",
      span: "md:col-span-2"
    },
    {
      title: "Rajasthan",
      duration: "7N/8D per person",
      price: "₹16,999",
      tag: "Heritage",
      image: "/assets/home/destinations/images/rajasthan.webp",
      span: "md:col-span-2"
    },
    {
      title: "Dubai",
      duration: "7N/8D per person",
      price: "₹35,999",
      tag: "Intl",
      image: "/assets/home/destinations/images/dubai.webp",
      span: "md:col-span-2"
    },
    {
      title: "Bali",
      duration: "5N/6D per person",
      price: "₹42,999",
      tag: "Intl",
      image: "/assets/home/destinations/images/bali.webp",
      span: "md:col-span-1"
    }
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-16 font-sans">
      {/* Title block */}
      <div className="flex justify-between items-end mb-8">
        <div className="text-left">
          <h2 className="text-[32px] font-bold font-satoshi text-[#1A1A1A] tracking-tight">Popular Destinations</h2>
          <p className="text-[#6B6B6B] text-[16px] font-medium font-quicksand mt-1">Curated holiday packages with flights + hotels</p>
        </div>
        <Link to="/packages" className="text-[#6B6B6B] hover:text-[#FF2D1A] text-[14px] font-semibold font-quicksand transition-colors flex items-center space-x-1">
          <span>View All Packages</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Asymmetric 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {destinations.map((dest, i) => (
          <Link
            key={i}
            to={`/coming-soon?feature=${encodeURIComponent(dest.title + " Holiday Package")}`}
            className={`relative h-64 rounded-2xl overflow-hidden group shadow-md cursor-pointer border border-gray-200/40 ${dest.span}`}
          >
            {/* Background Image */}
            <img
              src={dest.image}
              alt={dest.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">

              {/* Category tag pill in top-right */}
              <span className="absolute top-4 right-4 bg-white text-[#FF2D1A] text-[9px] font-normal font-satoshi uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider">
                {dest.tag}
              </span>

              {/* Left Details */}
              <div className="text-left pr-8 font-satoshi">
                <h3 className="text-white text-[26px] font-bold tracking-tight">{dest.title}</h3>
                <span className="text-white font-bold text-[18px] block mt-1">{dest.price}</span>
                <span className="text-white font-medium text-[14px] block mt-0.5">{dest.duration}</span>
              </div>

              {/* Centered Right Chevron */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>

            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
