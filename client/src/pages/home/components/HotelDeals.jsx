/**
 * ============================================================================
 * PATH: client/src/pages/home/components/HotelDeals.jsx
 * DESCRIPTION: Redesigned Top Hotel Deals grid matching Figma layout exactly.
 * ============================================================================
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";

export default function HotelDeals() {
  const navigate = useNavigate();

  const hotels = [
    {
      title: "Radisson Blu Goa",
      location: "Cavelossim · Goa",
      rating: 5,
      reviews: "3,120 reviews",
      originalPrice: "₹14,000",
      discount: "30% off",
      price: "₹9,800",
      taxes: "+ ₹1,176 taxes",
      image: "/assets/home/hotels/images/radisson.webp",
      amenities: ["Pool", "Spa", "Beach", "WiFi", "Bar"]
    },
    {
      title: "Hilton Goa Resort",
      location: "Cavelossim · Goa",
      rating: 5,
      reviews: "3,120 reviews",
      originalPrice: "₹14,000",
      discount: "30% off",
      price: "₹9,800",
      taxes: "+ ₹1,176 taxes",
      image: "/assets/home/hotels/images/hilton.webp",
      amenities: ["Pool", "Spa", "Beach", "WiFi", "Bar"]
    },
    {
      title: "The Park Calangute",
      location: "Cavelossim · Goa",
      rating: 5,
      reviews: "3,120 reviews",
      originalPrice: "₹14,000",
      discount: "30% off",
      price: "₹9,800",
      taxes: "+ ₹1,176 taxes",
      image: "/assets/home/hotels/images/park.webp",
      amenities: ["Pool", "Spa", "Beach", "WiFi", "Bar"]
    },
    {
      title: "Casa De Goa",
      location: "Cavelossim · Goa",
      rating: 5,
      reviews: "3,120 reviews",
      originalPrice: "₹14,000",
      discount: "30% off",
      price: "₹9,800",
      taxes: "+ ₹1,176 taxes",
      image: "/assets/home/hotels/images/casa.webp",
      amenities: ["Pool", "Spa", "Beach", "WiFi", "Bar"]
    }
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-6 py-16 font-sans">

      {/* Header Block */}
      <div className="flex justify-between items-end mb-8">
        <div className="text-left">
          <h2 className="text-[32px] font-bold font-satoshi text-[#1A1A1A] tracking-tight">Top Hotel Deals</h2>
          <p className="text-[#6B6B6B] text-[16px] font-medium font-quicksand mt-1">Best rates at 50,000+ properties across India</p>
        </div>
        <Link to="/hotels" className="text-[#6B6B6B] hover:text-[#FF2D1A] text-[14px] font-semibold font-quicksand transition-colors flex items-center space-x-1">
          <span>View All Hotels</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 4-Column Hotel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotels.map((hotel, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-xs flex flex-col group hover:shadow-md hover:border-gray-300 transition-all duration-300"
          >
            {/* Top Image Box */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={hotel.image}
                alt={hotel.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              {/* Luxury dark badge pill */}
              <span className="absolute top-[15.7px] left-[14.3px] bg-[#1A1A1A] text-white text-[11.25px] font-bold font-quicksand px-2 pt-[2px] pb-[4px] rounded-full leading-none">
                Luxury
              </span>
            </div>

            {/* Content Details Block */}
            <div className="p-4 flex flex-col flex-grow text-left justify-between space-y-3">
              <div>
                {/* Title */}
                <h3 className="font-bold font-satoshi text-[18px] text-[#1A1A1A] tracking-tight leading-tight">{hotel.title}</h3>

                {/* Location row */}
                <div className="flex items-center space-x-1 mt-1 font-quicksand">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[14px] font-medium text-[#6B6B6B]">{hotel.location}</span>
                </div>

                {/* Rating stars & reviews count */}
                <div className="flex items-center mt-1.5 space-x-0.5 font-quicksand">
                  <div className="flex text-[#FFB400] text-xs">
                    {Array.from({ length: hotel.rating }).map((_, idx) => (
                      <img key={idx} src="/assets/home/hotels/icons/star.svg" alt="Star" className="w-3 h-3 object-contain" />
                    ))}
                  </div>
                  <span className="text-[#6B6B6B] text-[11.25px] font-medium ml-1.5">({hotel.reviews})</span>
                </div>

                {/* Amenities Horizontal List */}
                <div className="flex flex-wrap gap-1 mt-3 font-quicksand">
                  {hotel.amenities.map((amenity, idx) => {
                    const hasIcon = amenity === "Pool" || amenity === "WiFi";
                    const iconPath = amenity === "Pool"
                      ? "/assets/home/hotels/icons/pool.svg"
                      : "/assets/home/hotels/icons/wifi.svg";
                    return (
                      <span
                        key={idx}
                        className="text-[11.25px] font-semibold text-[#6B6B6B] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full flex items-center space-x-1"
                      >
                        {hasIcon && (
                          <img src={iconPath} alt={amenity} className="w-[10px] h-[10px] object-contain flex-shrink-0" />
                        )}
                        <span>{amenity}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & CTA Button Block */}
              <div className="space-y-3 pt-3 border-t border-gray-100 w-full">
                {/* Original price & discount percentage */}
                <div className="flex items-center">
                  <span className="text-[11.25px] text-[#6B6B6B] line-through font-medium font-jetbrains">{hotel.originalPrice}</span>
                  <span className="bg-[#EAF7ED] text-[#529365] text-[11.25px] font-bold px-1.5 py-0.5 rounded-md ml-2 font-quicksand">
                    {hotel.discount}
                  </span>
                </div>

                {/* Main Price & Taxes */}
                <div className="flex items-baseline space-x-1.5 font-quicksand">
                  <span className="text-[24px] font-bold font-jetbrains text-[#1A1A1A]">{hotel.price}</span>
                  <span className="text-[11.25px] text-[#6B6B6B] font-medium">
                    {hotel.taxes} /night
                  </span>
                </div>

                {/* CTA details button */}
                <button
                  onClick={() => navigate(`/coming-soon?feature=${encodeURIComponent(hotel.title)}`)}
                  className="bg-[#FF2D1A] hover:bg-red-700 text-white text-[13.125px] font-bold font-quicksand py-3 rounded-xl w-full text-center transition-colors shadow-sm cursor-pointer"
                >
                  View Details
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
