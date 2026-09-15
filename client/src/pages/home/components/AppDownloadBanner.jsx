/**
 * ============================================================================
 * PATH: client/src/pages/home/components/AppDownloadBanner.jsx
 * DESCRIPTION: Redesigned App Promo download box matching Figma styles exactly.
 * ============================================================================
 */

import React from "react";
import { Plane, Hotel, Compass, Ticket, FileText, Menu, Bell } from "lucide-react";

export default function AppDownloadBanner() {
  return (
    <section className="bg-white py-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Slim Card Container with Grey outline & overflow-hidden */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 pl-12 flex flex-col md:flex-row items-center justify-between max-w-[1011px] mx-auto relative overflow-hidden h-[240px] shadow-sm">

          {/* Left Text Block */}
          <div className="space-y-3.5 max-w-[597px] z-10 text-left">
            <h2 className="text-[34px] font-bold font-satoshi text-[#1A1A1A] tracking-tight leading-tight">
              Plan Better, Travel Smarter
            </h2>
            <p className="font-inter text-[20px] font-normal text-[#272727] leading-normal max-w-[520px]">
              Download the FlyAnyTrip app for exclusive app-only deals, 1-tap bookings, and offline access to all your tickets.
            </p>
            {/* App Store & Google Play Badges */}
            <div className="flex space-x-3.5 pt-2">
              {/* App Store Badge */}
              <a 
                href="#app-store"
                className="hover:opacity-90 transition-all flex items-center h-[46px]"
              >
                <img src="/assets/home/app-download/icons/appstore.svg" alt="App Store" className="h-full object-contain" />
              </a>

              {/* Google Play Badge */}
              <a 
                href="#google-play"
                className="hover:opacity-90 transition-all flex items-center h-[46px]"
              >
                <img src="/assets/home/app-download/icons/playstore.svg" alt="Google Play" className="h-full object-contain" />
              </a>
            </div>
          </div>

          {/* Right Column: Wireframe Phone App Mockup */}
          <img 
            src="/assets/home/app-download/images/mobile.webp" 
            alt="FlyAnyTrip App Mockup" 
            className="absolute right-12 bottom-0 h-[240px] object-contain hidden md:block z-10 select-none" 
          />

        </div>
      </div>
    </section>
  );
}
