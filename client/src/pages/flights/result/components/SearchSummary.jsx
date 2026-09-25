/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/components/SearchSummary.jsx
 * DESCRIPTION: Premium sticky search summary card matching Figma design exactly.
 * ============================================================================
 */

import React from "react";
import { Edit2, ArrowLeftRight } from "lucide-react";

export default function SearchSummary({ 
  fromCode = "DEL",
  toCode = "BOM",
  depDate = "",
  adults = 1,
  children = 0,
  infants = 0,
  cabinClass = "Economy",
  isOneway = "Yes",
  onModify 
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", weekday: "short" });
  };

  const getPassengerText = () => {
    const total = Number(adults) + Number(children) + Number(infants);
    return `${total} Passenger${total > 1 ? "s" : ""}`;
  };

  return (
    <div className="sticky top-[82px] z-30 bg-[#f5f5f5] py-4.5 font-inter text-left select-none">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Border card wrapper matching screenshot */}
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-4.5 shadow-2xs">
          
          {/* Header Row */}
          <div className="flex items-center space-x-2 text-[10px] font-black mb-3 select-none">
            <span className="text-[#F12B19] uppercase tracking-wider">SEARCH SUMMARY</span>
            <span className="text-[#7E7E7E] font-bold normal-case">Sticky context bar &ndash; always visible while scrolling</span>
          </div>

          {/* Details Row */}
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm font-extrabold text-[#272727]">
            <div className="flex items-center space-x-5.5">
              
              {/* Route column block */}
              <div className="flex items-center space-x-2.5 select-none">
                <span className="text-xl font-black text-[#272727] tracking-tight">{fromCode}</span>
                <ArrowLeftRight className="w-4 h-4 text-[#272727] stroke-[2.5]" />
                <span className="text-xl font-black text-[#272727] tracking-tight">{toCode}</span>
              </div>

              <span className="text-gray-300 font-light text-base">|</span>
              <span className="text-[#272727] font-extrabold text-[13px]">{formatDate(depDate)}</span>
              
              <span className="text-gray-300 font-light text-base">|</span>
              <span className="text-[#272727] font-extrabold text-[13px]">{getPassengerText()} &bull; {cabinClass}</span>
              
              <span className="text-gray-300 font-light text-base">|</span>
              
              {/* Oneway / Round Trip pill tag */}
              <span className="bg-[#F5F5F5] border border-[#EAEAEA] text-[#272727] font-extrabold px-3.5 py-1 rounded-full text-[10.5px]">
                {isOneway === "Yes" ? "One Way" : "Round Trip"}
              </span>

            </div>

            {/* Modify Search Pencil Button */}
            <button 
              onClick={onModify}
              className="border border-[#EAEAEA] hover:bg-gray-50 text-[#272727] hover:text-[#000000] font-extrabold px-5 py-2.5 rounded-full text-[12px] transition-all flex items-center space-x-2 shadow-3xs bg-white active:scale-95 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#272727] stroke-[2.5]" />
              <span>Modify Search</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
