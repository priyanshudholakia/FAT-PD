/**
 * ============================================================================
 * PATH: client/src/pages/hotels/HotelsResultPage.jsx
 * ASSIGNED TO: Developer 3
 * DESCRIPTION: Hotels search results list
 * 
 * FIGMA PARTS:
 * 1. Modify destination search bar.
 * 2. Left filters column: Star counts, price sliders, user reviews, amenities.
 * 3. Main results column: Hotel listings showing images, key facilities, starting price.
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function HotelsResultPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hotels & Properties</h2>
            <p className="text-gray-400 text-sm">Showing properties matching your destination parameters</p>
          </div>
          <button 
            onClick={() => navigate("/hotels/1")} 
            className="bg-blue-650 hover:bg-blue-750 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            Review Sample Hotel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters column */}
          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Hotel Filters</h3>
            <p className="text-xs text-gray-500">[Developer 3: Add checklists & sliders from Figma here]</p>
          </aside>

          {/* Listings column */}
          <main className="lg:col-span-3 bg-gray-900 border border-gray-800 p-6 rounded-xl text-center text-gray-450">
            [Developer 3: Hotel results cards from Figma go here]
          </main>
        </div>
      </main>

      <Footer />
    </div>
  );
}
