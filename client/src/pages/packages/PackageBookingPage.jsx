/**
 * ============================================================================
 * PATH: client/src/pages/packages/PackageBookingPage.jsx
 * ASSIGNED TO: Developer 4
 * DESCRIPTION: Holiday Package traveler details and checkout forms page
 * 
 * FIGMA PARTS:
 * 1. Holiday selection review card (dates, headcount).
 * 2. Passenger forms list (generates list inputs for all travelers).
 * 3. Final cost summary sidebar and Razorpay payment triggers.
 * ============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function PackageBookingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        <h2 className="text-2xl font-bold mb-6">Review Tour Booking</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Selected Holiday Summary</h3>
              <p className="text-sm text-gray-500">[Developer 4: Booking package dates & options recap go here]</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Traveler Registration Forms</h3>
              <p className="text-sm text-gray-500">[Developer 4: Passenger input list details go here]</p>
            </div>
          </div>

          <aside className="bg-gray-900 border border-gray-800 p-6 rounded-xl h-fit space-y-6">
            <div>
              <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">Pricing Breakdown</h3>
              <p className="text-xs text-gray-500">[Developer 4: Base package costs & tax breakups go here]</p>
            </div>

            <button 
              onClick={() => navigate("/payment", {
                state: {
                  bookingType: "package",
                  tourPackage: {
                    name: "Spectacular Maldives Getaway (5 Nights / 6 Days)",
                    destination: "Malé Atoll, Maldives",
                    travelDate: "10 Jan 2027 · Sunday",
                    duration: "5 Nights / 6 Days",
                    travelers: "2 Adults (Rahul Sharma, Sneha Sharma)",
                    inclusions: "Speedboat Transfers · Ocean Villa Stay · Full Board Meals · Coral Reef Snorkeling"
                  },
                  traveler: {
                    lead: "Rahul Sharma",
                    email: "rahul.sharma@email.com",
                    phone: "+91 98765 43210",
                    others: "Sneha Sharma (Adult)"
                  },
                  basePrice: 75000,
                  taxes: 9000,
                  totalAmount: 84000
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
