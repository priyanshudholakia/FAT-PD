/**
 * ============================================================================
 * PATH: client/src/pages/hotels/HotelBookingPage.jsx
 * ASSIGNED TO: Developer 3
 * DESCRIPTION: Hotel details review and Guest Form inputs page
 * 
 * FIGMA PARTS:
 * 1. Stay overview card (dates, room inclusions).
 * 2. Guest Information form (Names, special requests).
 * 3. Price breakout card and Razorpay secure payment button.
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function HotelBookingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        <h2 className="text-2xl font-bold mb-6">Review & Book Stay</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Selected Hotel & Room Summary</h3>
              <p className="text-sm text-gray-500">[Developer 3: Booking parameters recap goes here]</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Guest Contact Details</h3>
              <p className="text-sm text-gray-500">[Developer 3: Guest details input fields go here]</p>
            </div>
          </div>

          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit space-y-6">
            <div>
              <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Pricing Breakdown</h3>
              <p className="text-xs text-gray-500">[Developer 3: Display night prices & taxes here]</p>
            </div>

            <button 
              onClick={() => navigate("/payment", {
                state: {
                  bookingType: "hotel",
                  hotel: {
                    name: "Grand Hyatt Mumbai & Residences",
                    roomType: "1x Deluxe King Room (Free Breakfast)",
                    checkIn: "24 Dec 2026 · 14:00 (Thursday)",
                    checkOut: "28 Dec 2026 · 12:00 (Monday)",
                    guests: "2 Adults · 4 Nights",
                    location: "Off Western Express Highway, Santacruz East, Mumbai, 400055"
                  },
                  guest: {
                    name: "Rahul Sharma (Lead Guest)",
                    email: "rahul.sharma@email.com",
                    phone: "+91 98765 43210"
                  },
                  basePrice: 24000,
                  taxes: 2880,
                  totalAmount: 26880
                }
              })} 
              className="w-full bg-red-650 hover:bg-red-700 py-3 rounded-lg font-bold transition-all text-sm"
            >
              Proceed to Secure Payment
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
