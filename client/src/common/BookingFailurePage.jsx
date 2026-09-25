/**
 * ============================================================================
 * PATH: client/src/common/BookingFailurePage.jsx
 * DESCRIPTION: Global Booking Failure Page matching the website design layout and fonts.
 *              Displays a red gradient banner, dynamically reads the booking type,
 *              shows the booking summary, and lists options to retry the transaction.
 * ============================================================================
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  CreditCard,
  Phone,
  ArrowLeft,
  RefreshCw,
  AlertOctagon,
  Plane,
  Building2,
  Compass,
  Star
} from "lucide-react";

import Header from "./Header";
import Footer from "./Footer";

export default function BookingFailurePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Retrieve transaction details from navigation context or fall back to defaults
  const bookingType = location.state?.bookingType || "flight";
  const basePrice = location.state?.basePrice || 3499;
  const taxes = location.state?.taxes || 420;
  const totalAmount = location.state?.totalAmount || (basePrice + taxes);

  const flight = location.state?.flight;
  const hotel = location.state?.hotel;
  const tourPackage = location.state?.tourPackage;

  const transactionId = location.state?.transactionId || "TXN-FAIL-89472A";

  // Was money actually taken? PaymentPage only ever routes here AFTER
  // Razorpay reported success — the failure that follows is Adivaha
  // rejecting the booking/ticket, not a declined card. Showing "Payment
  // Failed" / "Uncharged Amount" in that case is actively wrong: it tells a
  // customer who WAS charged that they weren't, and "Retry Payment" would
  // just resubmit the exact same doomed booking (e.g. a promo-locked fare)
  // and risk charging them a second time for a booking that can never
  // succeed. Only the Developer Sandbox's "Simulate Payment Failure" button
  // is a genuine pre-charge payment failure.
  const paymentSucceeded = !!location.state?.paymentSucceeded;

  // 2. Interactive Component States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(null);
  const [actionStatus, setActionStatus] = useState("");

  const showStatus = (message) => {
    setActionStatus(message);
    setTimeout(() => setActionStatus(""), 4000);
  };

  const handleRetry = () => {
    if (paymentSucceeded) {
      // Never resend this same booking to the payment step — the payment
      // already went through once; only the airline-side booking failed.
      // Retrying identical passenger/fare data would just reproduce the
      // same rejection (or worse, double-charge in a live gateway). Send
      // the customer back to search for a fresh, bookable fare instead.
      navigate("/flights");
      return;
    }
    // Genuine pre-charge payment failure (sandbox "Simulate Payment
    // Failure") — going back to retry the same payment is safe here.
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans">
      {/* Top Header Section */}
      <Header />

      {/* Main Page Layout Wrapper */}
      <main className="max-w-[1395px] mx-auto px-4 py-7 w-full flex-grow flex flex-col gap-[26px] font-quicksand">
        {/* Dynamic Action Alerts */}
        {actionStatus && (
          <div className="fixed top-24 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg border border-gray-800 z-50 flex items-center gap-3 animate-fade-in-up text-sm font-semibold">
            <X className="w-5 h-5 text-red-500" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* 1. Large Gradient Red "Payment Failed" Banner Card */}
        <section className="w-full bg-gradient-to-br from-[#EF4444] to-[#B91C1C] rounded-[22.5px] p-[37.5px] text-white flex flex-col items-center justify-center relative overflow-hidden shadow-xs min-h-[320px]">
          {/* Decorative background blur shapes */}
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none select-none blur-2xl"></div>
          <div className="absolute -right-10 -top-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none select-none blur-3xl"></div>

          {/* Content (Overlay z-10) */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[550px]">
            {/* Double Circle Cross Icon */}
            <div className="w-[75px] h-[75px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-[15px] shadow-inner">
              <div className="w-[45px] h-[45px] rounded-full bg-white flex items-center justify-center shadow-xs animate-pulse">
                <X className="w-6 h-6 text-[#EF4444]" strokeWidth={3.5} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-[33.75px] font-bold leading-[37.5px] mt-[15px]">
              {paymentSucceeded ? "Booking Could Not Be Confirmed" : "Payment Failed"}
            </h1>

            {/* Subtitle / Custom Error Message */}
            <p className="text-[15px] font-medium opacity-90 mt-[7.5px] mb-[22.5px] leading-[22.5px] max-w-[480px]">
              {location.state?.errorMessage || (paymentSucceeded
                ? "Your payment went through, but the airline could not confirm this booking. Our team will follow up shortly — any amount charged will be refunded if the ticket cannot be issued."
                : "The transaction was declined by your banking provider or timed out. Don't worry, if any money was deducted it will be refunded within 3-5 business days.")}
            </p>

            {/* Reference info */}
            <p className="text-[11.25px] font-medium opacity-80 uppercase tracking-wider font-jetbrains">
              Transaction ID: <span className="font-bold">{transactionId}</span>
            </p>
          </div>
        </section>

        {/* 2. Grid Layout: Left Details vs. Right Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_270px] gap-[22.5px] items-start w-full">

          {/* Left Column (Failed Booking Item Recap, Payment Details) */}
          <div className="flex flex-col gap-[15px] w-full">

            {/* A. Failed Booking details summary based on Vertical */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[20px] flex flex-col gap-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">

              {/* Vertical specific heading */}
              <div className="flex items-center gap-[8px] border-b border-gray-100 pb-[12px]">
                <div className="w-[26px] h-[26px] rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                  {bookingType === "flight" && <Plane className="w-[13px] h-[13px] transform rotate-45" />}
                  {bookingType === "hotel" && <Building2 className="w-[13px] h-[13px]" />}
                  {bookingType === "package" && <Compass className="w-[13px] h-[13px]" />}
                </div>
                <h3 className="text-[16.875px] font-bold text-gray-900">
                  {bookingType === "flight" && "Flight Booking Summary"}
                  {bookingType === "hotel" && "Hotel Room Details"}
                  {bookingType === "package" && "Tour Package Summary"}
                </h3>
              </div>

              {/* Dynamic properties */}
              <div className="flex flex-col gap-[4px]">
                {bookingType === "flight" && (
                  <>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Flight</span>
                      <span className="text-[16px] font-semibold text-gray-800">
                        {flight?.airline || "IndiGo"} {flight?.code || "6E-204"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Route</span>
                      <span className="text-[16px] font-semibold text-gray-800">
                        {(() => {
                          // Try to extract actual route from flight data
                          const fromCode = flight?.fromCode || flight?.rawOption?.Segments?.[0]?.[0]?.Origin?.AirportCode;
                          const toCode = flight?.toCode || flight?.rawOption?.Segments?.[0]?.[0]?.Destination?.AirportCode;
                          if (fromCode && toCode) {
                            return `${fromCode} → ${toCode}`;
                          }
                          return flight?.route || "New Delhi (DEL) → Mumbai (BOM)";
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] last:border-b-0">
                      <span className="text-[14px] font-semibold text-gray-400">Travel Date</span>
                      <span className="text-[16px] font-semibold text-gray-800">
                        {(() => {
                          // Try multiple sources for the actual travel date
                          const depTime = flight?.rawOption?.Segments?.[0]?.[0]?.Origin?.DepTime;
                          if (depTime) {
                            const date = new Date(depTime);
                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} · ${days[date.getDay()]}`;
                          }
                          // Fallback to other date fields
                          return flight?.date || flight?.travelDate || flight?.departureDate || "15 Dec 2024 · Sunday";
                        })()}
                      </span>
                    </div>
                  </>
                )}

                {bookingType === "hotel" && (
                  <>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Hotel Stay</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right max-w-sm">
                        {hotel?.name || "Grand Hyatt Mumbai & Residences"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Room</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right">
                        {hotel?.roomType || "1x Deluxe King Room"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] last:border-b-0">
                      <span className="text-[14px] font-semibold text-gray-400">Check-in</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right font-medium">
                        {hotel?.checkIn || "24 Dec 2026"}
                      </span>
                    </div>
                  </>
                )}

                {bookingType === "package" && (
                  <>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Package Tour</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right max-w-sm">
                        {tourPackage?.name || "Spectacular Maldives Getaway"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                      <span className="text-[14px] font-semibold text-gray-400">Destination</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right">
                        {tourPackage?.destination || "Malé, Maldives"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-[8px] last:border-b-0">
                      <span className="text-[14px] font-semibold text-gray-400">Travel Date</span>
                      <span className="text-[16px] font-semibold text-gray-800 text-right">
                        {tourPackage?.travelDate || "10 Jan 2027"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* B. Billing summary details */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[18.75px] flex flex-col gap-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              {/* Heading */}
              <div className="flex items-center gap-[8px] border-b border-gray-100 pb-[12px]">
                <div className="w-[26px] h-[26px] rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-[13px] h-[13px]" />
                </div>
                <h3 className="text-[16.875px] font-bold text-gray-900">
                  Transaction Summary
                </h3>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Base Cost</span>
                  <span className="text-[16px] font-semibold text-gray-800">₹{basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Taxes & Fees</span>
                  <span className="text-[16px] font-semibold text-gray-800">₹{taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] last:border-b-0">
                  <span className="text-[14px] font-bold text-gray-800">
                    {paymentSucceeded ? "Amount Charged (pending refund if unresolved)" : "Uncharged Amount"}
                  </span>
                  <span className="text-[18px] font-extrabold text-[#EF4444]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Actions Sidebar (Retry booking, helper details, home return) */}
          <aside className="flex flex-col gap-[15px] w-full">

            {/* 1. Transaction Actions */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[18.75px] flex flex-col gap-[15px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              <h4 className="text-[15px] font-bold text-gray-900 border-b border-gray-100 pb-2">
                Resolve Error
              </h4>
              <div className="flex flex-col gap-[10px] mt-1">
                {/* Retry payment button */}
                <button
                  onClick={handleRetry}
                  className="w-full bg-[#FE2C1C] hover:bg-[#D82212] active:scale-98 text-white py-[11.25px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-[14px] h-[14px]" />
                  <span>{paymentSucceeded ? "Search a New Flight" : "Retry Payment"}</span>
                </button>

                {/* Change payment method or cancel booking */}
                <Link to="/" className="w-full">
                  <button className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[9.375px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer">
                    <ArrowLeft className="w-[13px] h-[13px]" />
                    <span>Return to Home</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* 2. Star feedback card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[15px] flex flex-col items-center gap-[8px] text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <span className="text-[11.25px] font-bold text-gray-800">
                Rate this checkout flow
              </span>

              {/* Interactive Stars */}
              <div className="flex items-center gap-[3.75px] py-1">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const isActive = hoverRating !== null ? starIdx <= hoverRating : starIdx <= rating;
                  return (
                    <button
                      key={starIdx}
                      type="button"
                      onMouseEnter={() => setHoverRating(starIdx)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => {
                        setRating(starIdx);
                        showStatus(`Thank you for rating! We will inspect this transaction.`);
                      }}
                      className="transition-transform active:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-[18px] h-[18px] ${isActive
                            ? "fill-[#FDC700] text-[#FDC700]"
                            : "text-gray-300"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-[11.25px] font-bold text-[#E0E0E0] hover:text-[#FE2C1C] transition-colors cursor-pointer select-none">
                Give us feedback
              </span>
            </div>

            {/* 3. Customer support card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[15px] flex flex-col gap-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              <span className="text-[11.25px] font-bold text-gray-800 uppercase tracking-wider">
                Helpline 24/7
              </span>
              <span className="text-[11.25px] font-medium text-gray-500 -mt-1">
                Need help recovering this booking?
              </span>
              <button
                onClick={() => showStatus("Dialing payment recovery line... Support is connecting at 1800-000-4567")}
                className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[7.5px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                <Phone className="w-[13px] h-[13px]" />
                <span>Call Payments Desk</span>
              </button>
            </div>

          </aside>

        </div>
      </main>

      {/* Bottom Footer Section */}
      <Footer />
    </div>
  );
}
