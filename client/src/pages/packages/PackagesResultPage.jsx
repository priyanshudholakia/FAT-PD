/**
 * ============================================================================
 * PATH: client/src/pages/packages/PackagesResultPage.jsx
 * ASSIGNED TO: Developer 4
 * DESCRIPTION: Holiday/Tour packages search catalog list
 * 
 * FIGMA PARTS:
 * 1. Filters sidebar: Destinations dropdown, budget selectors, durations checklist.
 * 2. Packages Grid: Package thumbnail cards showing inclusions icons (flights + hotels)
 *    and redirection buttons.
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function PackagesResultPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Discover Holiday Packages</h2>
            <p className="text-gray-400 text-sm">Curated domestic and international travel packages</p>
          </div>
          <button 
            onClick={() => navigate("/packages/1")} 
            className="bg-blue-650 hover:bg-blue-750 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            Review Sample Package
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters column */}
          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Package Filters</h3>
            <p className="text-xs text-gray-500">[Developer 4: Selectors for theme and budget go here]</p>
          </aside>

          {/* Listings column */}
          <main className="lg:col-span-3 bg-gray-900 border border-gray-800 p-6 rounded-xl text-center text-gray-450">
            [Developer 4: Holiday packages grid cards go here]
          </main>
        </div>
      </main>

      <Footer />
    </div>
  );
}
