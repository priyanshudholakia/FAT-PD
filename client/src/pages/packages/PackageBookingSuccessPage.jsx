/**
 * ============================================================================
 * PATH: client/src/pages/packages/PackageBookingSuccessPage.jsx
 * DESCRIPTION: Package Tour Booking Success Page matching the Figma layout.
 *              Displays gradient orange/coral hero banner, package itinerary,
 *              traveler list, payment breakout, and coordinator actions.
 * ============================================================================
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  Copy,
  Compass,
  Users,
  CreditCard,
  Star,
  Download,
  Mail,
  MapPin,
  Settings,
  Phone,
  ArrowRight,
  ClipboardList
} from "lucide-react";

import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function PackageBookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Figma design default configurations
  const defaultTour = {
    name: "Spectacular Maldives Getaway (5 Nights / 6 Days)",
    destination: "Malé Atoll, Maldives",
    travelDate: "10 Jan 2027 · Sunday",
    duration: "5 Nights / 6 Days",
    travelers: "2 Adults (Rahul Sharma, Sneha Sharma)",
    inclusions: "Speedboat Transfers · Ocean Villa Stay · Full Board Meals · Coral Reef Snorkeling"
  };

  const defaultTraveler = {
    lead: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    others: "Sneha Sharma (Adult)"
  };

  const defaultPayment = {
    baseFare: 75000,
    taxes: 9000,
    totalPaid: 84000,
    method: "HDFC Credit Card · XXXX 4521",
    transactionId: "TOUR-TXN583921"
  };

  // 2. Hydrate states from navigation context, or fall back to Figma design defaults
  const tour = {
    ...defaultTour,
    ...(location.state?.tourPackage || {})
  };

  const traveler = {
    ...defaultTraveler,
    ...(location.state?.traveler || {})
  };

  const payment = {
    ...defaultPayment,
    baseFare: location.state?.basePrice || defaultPayment.baseFare,
    taxes: location.state?.taxes || defaultPayment.taxes,
    totalPaid: location.state?.totalAmount || defaultPayment.totalPaid
  };

  const bookingId = location.state?.bookingId || "FAT-PKG-98214B";
  const userEmail = location.state?.email || traveler.email;

  // 3. Interactive Component States
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [actionStatus, setActionStatus] = useState("");

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showStatus = (message) => {
    setActionStatus(message);
    setTimeout(() => setActionStatus(""), 4000);
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
            <Check className="w-5 h-5 text-emerald-450" />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* 1. Large Gradient Orange/Sunset "Tour Booked!" Banner Card */}
        <section className="w-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-[22.5px] p-[37.5px] text-white flex flex-col items-center justify-center relative overflow-hidden shadow-xs min-h-[358px]">
          {/* Decorative Background Elements */}
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none select-none blur-2xl"></div>
          <div className="absolute -right-10 -top-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none select-none blur-3xl"></div>

          {/* Content (Overlay z-10) */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[500px]">
            {/* Double Circle Check Icon */}
            <div className="w-[75px] h-[75px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-[15px] shadow-inner">
              <div className="w-[45px] h-[45px] rounded-full bg-white flex items-center justify-center shadow-xs">
                <Check className="w-6 h-6 text-[#EA580C]" strokeWidth={3.5} />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-[33.75px] font-bold leading-[37.5px] mt-[15px]">
              Tour Booked!
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] font-medium opacity-90 mt-[7.5px] mb-[22.5px] leading-[22.5px]">
              Your holiday package reservation is confirmed. Happy travels!
            </p>

            {/* Booking Reference Pill */}
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-[15px] p-[15px] flex items-center justify-between gap-[15px] w-[280px] h-[77px]">
              <div className="flex flex-col text-left justify-center">
                <span className="text-[11.25px] font-semibold text-white/80 uppercase tracking-wider">
                  Booking ID
                </span>
                <span className="text-[20px] font-bold font-jetbrains tracking-wider text-white">
                  {bookingId}
                </span>
              </div>
              <button
                onClick={handleCopyBookingId}
                className="bg-white/25 hover:bg-white/40 active:scale-95 transition-all border border-white/20 rounded-[13.375px] py-[7.5px] px-[11.25px] flex items-center gap-[5.625px] text-white text-[11.25px] font-bold cursor-pointer"
              >
                <Copy className="w-[11.25px] h-[11.25px]" />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Confirmation Email footer */}
            <p className="text-[11.25px] font-medium opacity-80 mt-[15px]">
              Itinerary & receipt sent to <span className="underline font-semibold">{userEmail}</span>
            </p>
          </div>
        </section>

        {/* 2. Grid Layout: Left Cards vs. Right Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_270px] gap-[22.5px] items-start w-full">
          
          {/* Left Column (Tour Details, Traveler Details, Payment Summary) */}
          <div className="flex flex-col gap-[15px] w-full">
            
            {/* A. Tour Details Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[20px] flex flex-col gap-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              {/* Heading */}
              <div className="flex items-center gap-[8px] border-b border-gray-100 pb-[12px]">
                <div className="w-[26px] h-[26px] rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Compass className="w-[13px] h-[13px]" />
                </div>
                <h3 className="text-[16.875px] font-bold text-gray-900">
                  Package Details
                </h3>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Package Name</span>
                  <span className="text-[16px] font-semibold text-gray-800 text-right max-w-lg">
                    {tour.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Destination</span>
                  <span className="text-[16px] font-semibold text-gray-800 text-right">{tour.destination}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Travel Date</span>
                  <span className="text-[16px] font-semibold text-gray-800 text-right">{tour.travelDate}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Duration</span>
                  <span className="text-[16px] font-semibold text-gray-800 text-right">{tour.duration}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Travelers Count</span>
                  <span className="text-[16px] font-semibold text-gray-800 text-right">{tour.travelers}</span>
                </div>
                <div className="flex items-start justify-between py-[8px] last:border-b-0">
                  <span className="text-[14px] font-semibold text-gray-400 mt-0.5">Inclusions</span>
                  <span className="text-[14px] font-semibold text-gray-600 text-right max-w-md">
                    {tour.inclusions}
                  </span>
                </div>
              </div>
            </div>

            {/* B. Traveler Registration Details Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[18.75px] flex flex-col gap-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              {/* Heading */}
              <div className="flex items-center gap-[8px] border-b border-gray-100 pb-[12px]">
                <div className="w-[26px] h-[26px] rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-[13px] h-[13px]" />
                </div>
                <h3 className="text-[16.875px] font-bold text-gray-900">
                  Traveler Details
                </h3>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Lead Traveler</span>
                  <span className="text-[16px] font-semibold text-gray-800">{traveler.lead}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Other Travelers</span>
                  <span className="text-[16px] font-semibold text-gray-800">{traveler.others}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Email Address</span>
                  <span className="text-[16px] font-semibold text-gray-800">{traveler.email}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] last:border-b-0">
                  <span className="text-[14px] font-semibold text-gray-400">Contact Number</span>
                  <span className="text-[16px] font-semibold text-gray-800">{traveler.phone}</span>
                </div>
              </div>
            </div>

            {/* C. Payment Breakout Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[18.75px] flex flex-col gap-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              {/* Heading */}
              <div className="flex items-center gap-[8px] border-b border-gray-100 pb-[12px]">
                <div className="w-[26px] h-[26px] rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-[13px] h-[13px]" />
                </div>
                <h3 className="text-[16.875px] font-bold text-gray-900">
                  Payment Summary
                </h3>
              </div>

              {/* Data Rows */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Package Fare</span>
                  <span className="text-[16px] font-semibold text-gray-800">₹{payment.baseFare.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Taxes & GST</span>
                  <span className="text-[16px] font-semibold text-gray-800">₹{payment.taxes.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-bold text-gray-800">Total Paid</span>
                  <span className="text-[18px] font-extrabold text-[#FE2C1C]">
                    ₹{payment.totalPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-[8px] border-b border-gray-100/70">
                  <span className="text-[14px] font-semibold text-gray-400">Payment Method</span>
                  <span className="text-[16px] font-semibold text-gray-800">{payment.method}</span>
                </div>
                <div className="flex items-center justify-between py-[8px] last:border-b-0">
                  <span className="text-[14px] font-semibold text-gray-400">Transaction ID</span>
                  <span className="text-[16px] font-semibold text-gray-800 font-jetbrains">{payment.transactionId}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Actions Sidebar (Booking Actions, Stars, Help, Book another trip) */}
          <aside className="flex flex-col gap-[15px] w-full">

            {/* 1. Booking Actions Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[18.75px] flex flex-col gap-[15px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              <h4 className="text-[15px] font-bold text-gray-900 border-b border-gray-100 pb-2">
                Booking Actions
              </h4>
              <div className="flex flex-col gap-[10px] mt-1">
                {/* Download Complete Itinerary */}
                <button
                  onClick={() => showStatus("Preparing PDF download... Your detailed day-by-day Itinerary is downloading.")}
                  className="w-full bg-[#FE2C1C] hover:bg-[#D82212] active:scale-98 text-white py-[11.25px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-[14px] h-[14px]" />
                  <span>Download Itinerary</span>
                </button>

                {/* Email Voucher */}
                <button
                  onClick={() => showStatus(`Tour booking confirmation PDF dispatched to: ${userEmail}`)}
                  className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[9.375px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Mail className="w-[13px] h-[13px]" />
                  <span>Email Voucher</span>
                </button>

                {/* Travel Checklist */}
                <button
                  onClick={() => showStatus("Downloading Maldives Travel Guidelines & Checklist PDF...")}
                  className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[9.375px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ClipboardList className="w-[13px] h-[13px]" />
                  <span>Travel Checklist</span>
                </button>

                {/* Manage Tour */}
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[9.375px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Settings className="w-[13px] h-[13px]" />
                  <span>Manage Booking</span>
                </button>
              </div>
            </div>

            {/* 2. Star Rating Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[15px] flex flex-col items-center gap-[8px] text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <span className="text-[11.25px] font-bold text-gray-800">
                Rate your Tour Booking
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
                        showStatus(`Thank you for rating your package booking ${starIdx} stars!`);
                      }}
                      className="transition-transform active:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-[18px] h-[18px] ${
                          isActive
                            ? "fill-[#FDC700] text-[#FDC700]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-[11.25px] font-bold text-[#E0E0E0] hover:text-[#FE2C1C] transition-colors cursor-pointer select-none">
                Feedback helps us improve
              </span>
            </div>

            {/* 3. Need Help Card */}
            <div className="bg-white rounded-[20px] border border-gray-200/80 p-[15px] flex flex-col gap-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-left">
              <span className="text-[11.25px] font-bold text-gray-800 uppercase tracking-wider">
                Holiday Coordinator
              </span>
              <span className="text-[11.25px] font-medium text-gray-500 -mt-1">
                24/7 dedicated packages helpline
              </span>
              <button
                onClick={() => showStatus("Dialing helpline... Support is connecting at 1800-200-8899")}
                className="w-full border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-98 py-[7.5px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                <Phone className="w-[13px] h-[13px]" />
                <span>Contact Coordinator</span>
              </button>
            </div>

            {/* 4. Book Another Package Card */}
            <Link to="/" className="w-full">
              <button className="w-full bg-white hover:bg-gray-50 active:scale-98 border border-gray-200 text-gray-800 py-[11.25px] rounded-[10px] font-bold text-[13.125px] flex items-center justify-center gap-[7.5px] transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <Compass className="w-[14px] h-[14px] text-gray-800 flex-shrink-0" />
                <span>Book Another Tour</span>
                <ArrowRight className="w-[12px] h-[12px] text-gray-800 flex-shrink-0" />
              </button>
            </Link>

          </aside>

        </div>
      </main>

      {/* Bottom Footer Section */}
      <Footer />
    </div>
  );
}
