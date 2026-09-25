/**
 * ============================================================================
 * PATH: client/src/common/HeaderTopBar.jsx
 * DESCRIPTION: Redesigned topmost utility bar matching the Figma layout exactly.
 * ============================================================================
 */

import React from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function HeaderTopBar() {
  return (
    <div className="bg-gradient-to-r from-[#FFF1F2] via-[#FECDD3] to-[#FFF1F2] text-[11.25px] text-[#272727] font-medium py-1.5 border-b border-[#FECDD3]/40 w-full font-quicksand">
      <div className="max-w-[1440px] mx-auto px-[22.5px] flex items-center justify-between">
        {/* Left Links */}
        <div className="flex space-x-3.5 items-center">
          <span className="flex items-center space-x-1 cursor-pointer">
            <img src="/assets/home/header-topbar/icons/globe.svg" alt="India" className="w-[10px] h-[10px]" />
            <span> India (INR ₹)</span>
          </span>
          <span className="text-[#272727]/30">|</span>
          <span className="flex items-center space-x-1 cursor-pointer">
            <span>English</span>
          </span>
          <span className="text-[#272727]/30">|</span>
          <span className="flex items-center space-x-1">
            <Phone className="w-[10px] h-[10px] text-[#272727]" />
            <span className="text-[#272727] font-medium">1800-000-4567 (24/7 Toll Free)</span>
          </span>
        </div>

        {/* Right Links */}
        <div className="flex space-x-4 items-center text-[#272727] font-medium">
          <Link to="/support" className="hover:text-[#FF2D1A] transition-colors">Help Center</Link>
          <span className="text-[#272727]/30">|</span>
          <Link to="/offers" className="hover:text-[#FF2D1A] transition-colors">Offers & Deals</Link>
          <span className="text-[#272727]/30">|</span>
          <Link to="/corporate" className="hover:text-[#FF2D1A] transition-colors">Corporate Travel</Link>
        </div>
      </div>
    </div>
  );
}
