/**
 * ============================================================================
 * PATH: client/src/common/Navbar.jsx
 * DESCRIPTION: Redesigned navigation bar matching the Figma design system exactly.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const isFlightsActive = location.pathname.startsWith("/flights");
  const isHotelsActive = location.pathname.startsWith("/hotels");
  const isPackagesActive = location.pathname.startsWith("/packages");
  const isHolidaysActive = location.pathname.startsWith("/holidays");

  // State to control visibility of Flights, Hotels, Tour Packages & Holidays tabs
  const [showSearchTabs] = useState(true);

  // Tab click redirect handler
  const handleTabClick = (e, tabId) => {
    e.preventDefault();
    if (isHome) {
      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Dispatch event to update active tab in HeroSection
      window.dispatchEvent(new CustomEvent("setHeroTab", { detail: tabId }));
    } else {
      // Navigate to home and pass target tab state
      navigate("/", { state: { heroTab: tabId } });
    }
  };

  return (
    <div className="bg-white py-3.5 w-full font-quicksand">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center group">
          <img src="/assets/home/header/icons/logo.svg" alt="FlyAnyTrip" className="h-8 object-contain" />
        </Link>

        {/* Navigation links & Separators */}
        <nav className="hidden lg:flex items-center gap-1.5 text-[13.125px] font-semibold text-[#6B6B6B]">

          {/* Scroll-Linked Search Links */}
          {showSearchTabs && (
            <>
              <Link
                to="/flights"
                onClick={(e) => handleTabClick(e, "flights")}
                className={`flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group ${isFlightsActive
                  ? "text-[#FF2D1A]"
                  : "hover:text-[#FF2D1A] hover:bg-gray-50 text-[#6B6B6B]"
                  }`}
                style={isFlightsActive ? { background: "linear-gradient(to bottom, rgba(254, 206, 202, 0), rgba(254, 206, 202, 1))" } : {}}
              >
                <img
                  src="/assets/home/header/icons/flight.svg"
                  alt="Flights"
                  className={`h-[14px] w-auto object-contain transition-all ${isFlightsActive
                    ? "active-red-icon"
                    : "group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%]"
                    }`}
                />
                <span>Flights</span>
              </Link>

              <Link
                to="/hotels"
                onClick={(e) => handleTabClick(e, "hotels")}
                className={`flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group ${isHotelsActive
                  ? "text-[#FF2D1A]"
                  : "hover:text-[#FF2D1A] hover:bg-gray-50 text-[#6B6B6B]"
                  }`}
                style={isHotelsActive ? { background: "linear-gradient(to bottom, rgba(254, 206, 202, 0), rgba(254, 206, 202, 1))" } : {}}
              >
                <img
                  src="/assets/home/header/icons/hotel.svg"
                  alt="Hotels"
                  className={`h-[14px] w-auto object-contain transition-all ${isHotelsActive
                    ? "active-red-icon"
                    : "group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%]"
                    }`}
                />
                <span>Hotels</span>
              </Link>

              <Link
                to="/packages"
                onClick={(e) => handleTabClick(e, "holidays")}
                className={`flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group ${isPackagesActive
                  ? "text-[#FF2D1A]"
                  : "hover:text-[#FF2D1A] hover:bg-gray-50 text-[#6B6B6B]"
                  }`}
                style={isPackagesActive ? { background: "linear-gradient(to bottom, rgba(254, 206, 202, 0), rgba(254, 206, 202, 1))" } : {}}
              >
                <img
                  src="/assets/home/header/icons/package.svg"
                  alt="Tour Packages"
                  className={`h-[16px] w-auto object-contain transition-all ${isPackagesActive
                    ? "active-red-icon"
                    : "group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%]"
                    }`}
                />
                <span>Tour Packages</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isPackagesActive ? "text-[#FF2D1A]" : "text-[#6B6B6B]"}`} />
              </Link>

              <div
                onClick={(e) => handleTabClick(e, "holidays")}
                className={`cursor-pointer flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group ${isHolidaysActive
                  ? "text-[#FF2D1A]"
                  : "hover:text-[#FF2D1A] hover:bg-gray-50 text-[#6B6B6B]"
                  }`}
                style={isHolidaysActive ? { background: "linear-gradient(to bottom, rgba(254, 206, 202, 0), rgba(254, 206, 202, 1))" } : {}}
              >
                <img
                  src="/assets/home/header/icons/holiday.svg"
                  alt="Holidays"
                  className={`h-[16px] w-auto object-contain transition-all ${isHolidaysActive
                    ? "active-red-icon"
                    : "group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%]"
                    }`}
                />
                <span>Holidays</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isHolidaysActive ? "text-[#FF2D1A]" : "text-[#6B6B6B]"}`} />
              </div>

              {/* Figma Spacing Separator */}
              <span className="text-gray-200">|</span>
            </>
          )}

          <Link to="/dashboard" className="hover:text-[#FF2D1A] hover:bg-gray-50 flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group">
            <img src="/assets/home/header/icons/booking.svg" alt="My Bookings" className="h-[16px] w-auto object-contain group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%] transition-all" />
            <span>My Bookings</span>
          </Link>

          <Link to="/support" className="hover:text-[#FF2D1A] hover:bg-gray-50 flex items-center space-x-1.5 transition-all py-1.5 px-2 rounded-lg group">
            <img src="/assets/home/header/icons/support.svg" alt="Support" className="h-[16px] w-auto object-contain group-hover:filter group-hover:brightness-0 group-hover:invert-[26%] group-hover:sepia-[95%] group-hover:saturate-[5968%] group-hover:hue-rotate-[353deg] group-hover:value-[100%] transition-all" />
            <span>Support</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 text-[15.82px] font-satoshi">
          <Link to="/register" className="bg-[#FF2D1A] hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all">
            Sign Up Free
          </Link>
          <Link to="/login" className="border border-gray-300 hover:bg-gray-50 text-[#272727] px-4 py-2 rounded-lg font-normal flex items-center space-x-1.5 transition-all">
            <img src="/assets/home/header/icons/login.svg" alt="Login" className="h-[16px] w-auto object-contain" />
            <span>Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

