/**
 * ============================================================================
 * PATH: client/src/pages/packages/PackageDetailsPage.jsx
 * ASSIGNED TO: Developer 4
 * DESCRIPTION: Holiday Package itinerary and pricing details page
 * 
 * FIGMA PARTS:
 * 1. Image Banner header.
 * 2. Itinerary tab navigation (itinerary details, inclusions/exclusions list, terms).
 * 3. Booking widget (Date selector, traveler quantity counter, select package CTA).
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function PackageDetailsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Banner image header */}
        <div className="bg-gray-900 border border-gray-800 h-80 rounded-2xl mb-8 flex items-center justify-center text-gray-500">
          [Developer 4: Large destination cover banner goes here]
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold">Maldives Holiday Package</h2>
              <p className="text-gray-400 mt-1">4 Nights / 5 Days &bull; flights + resorts included</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-4">Tour Itinerary Details</h3>
              <p className="text-sm text-gray-500 mb-6">[Developer 4: Day-by-Day schedule lists go here]</p>
              
              <button 
                onClick={() => navigate("/packages/book")} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Book Package Now
              </button>
            </div>
          </div>

          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Holiday Booking Parameters</h3>
            <p className="text-xs text-gray-500">[Developer 4: Date picker & passenger selectors go here]</p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
