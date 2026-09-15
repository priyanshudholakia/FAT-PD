/**
 * ============================================================================
 * PATH: client/src/pages/hotels/HotelDetailsPage.jsx
 * ASSIGNED TO: Developer 3
 * DESCRIPTION: Hotel profile details page
 * 
 * FIGMA PARTS:
 * 1. Image gallery grid.
 * 2. About section & amenities icons.
 * 3. Room categories listings table showing inclusions & "Select / Book" CTAs.
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function HotelDetailsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Photo Gallery Grid */}
        <div className="bg-gray-900 border border-gray-800 h-96 rounded-2xl mb-8 flex items-center justify-center text-gray-500">
          [Developer 3: Figma Hotel Image Grid goes here]
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Luxury Resort Hotel</h2>
              <p className="text-gray-400 mt-1">Star rating tag & address location</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-4">Available Rooms</h3>
              <p className="text-sm text-gray-500 mb-6">[Developer 3: Room options listing rows go here]</p>
              
              <button 
                onClick={() => navigate("/hotels/book")} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Proceed with Selected Room
              </button>
            </div>
          </div>

          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit">
            <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Map Location</h3>
            <p className="text-xs text-gray-500">[Developer 3: Map widget goes here]</p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
