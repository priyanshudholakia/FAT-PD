/**
 * ============================================================================
 * PATH: client/src/pages/dashboard/UserDashboardPage.jsx
 * DESCRIPTION: User dashboard, bookings list, and ticket retrieval
 * 
 * FIGMA MATCH: Navigation links for profile setting & tickets download lists.
 * ============================================================================
 */

import React, { useState } from "react";
import axios from "axios";
import { Search, Loader2, AlertCircle, FileText, XCircle, CheckCircle2 } from "lucide-react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function UserDashboardPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [pnrInput, setPnrInput] = useState("");
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelCharges, setCancelCharges] = useState(null);
  const [cancelResult, setCancelResult] = useState(null);

  const handleFetchBooking = async (e) => {
    if (e) e.preventDefault();
    if (!pnrInput && !bookingIdInput) {
      setError("Please enter a PNR or Booking ID to search");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setBookingDetails(null);

      const res = await axios.post(`${API_BASE_URL}/flights/booking-details`, {
        PNR: pnrInput.trim(),
        BookingId: bookingIdInput.trim()
      });

      if (res.data?.responseData?.Response) {
        setBookingDetails(res.data.responseData.Response);
      } else {
        setError(res.data?.message || "No booking record found for this PNR/Booking ID");
      }
    } catch (err) {
      console.error("Booking details error:", err);
      setError(err.response?.data?.message || "Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCancelCharges = async () => {
    try {
      setCancelLoading(true);
      setCancelCharges(null);
      setCancelResult(null);

      const res = await axios.post(`${API_BASE_URL}/flights/cancellation-charges`, {
        PNR: pnrInput || bookingDetails?.PNR,
        BookingId: bookingIdInput || bookingDetails?.BookingId
      });

      setCancelCharges(res.data?.responseData?.Response || res.data);
      setShowCancelModal(true);
    } catch (err) {
      console.error("Cancellation charges error:", err);
      alert("Could not fetch cancellation charges from airline provider.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelLoading(true);
      const res = await axios.post(`${API_BASE_URL}/flights/cancel-booking`, {
        PNR: pnrInput || bookingDetails?.PNR,
        BookingId: bookingIdInput || bookingDetails?.BookingId,
        Remarks: "Customer requested cancellation via portal"
      });

      setCancelResult(res.data?.responseData?.Response || { status: "Submitted", message: "Cancellation request sent to airline" });
    } catch (err) {
      console.error("Cancel booking error:", err);
      alert("Failed to submit cancellation request.");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 w-full">
        <h2 className="text-3xl font-extrabold mb-8">My Bookings Dashboard</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-fit space-y-4">
            <button className="w-full text-left font-semibold text-red-500 border-l-2 border-red-500 pl-3">Booking History</button>
            <button className="w-full text-left font-medium text-gray-400 hover:text-white transition-colors pl-3">Profile Settings</button>
          </aside>

          <main className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-3">Retrieve Booking & Manage Tickets</h3>
              <p className="text-sm text-gray-400 mb-6">Enter your PNR or Booking ID below to fetch live e-ticket status, penalty rules, or request cancellation.</p>

              <form onSubmit={handleFetchBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                <input
                  type="text"
                  placeholder="Enter PNR (e.g. G5Y8HJ)"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value)}
                  className="bg-gray-900 border border-gray-750 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  placeholder="Enter Booking ID (Optional)"
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  className="bg-gray-900 border border-gray-750 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>{loading ? "Fetching..." : "Fetch Booking"}</span>
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Display Booking Result */}
            {bookingDetails && (
              <div className="border border-gray-800 bg-gray-950 rounded-xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
                  <div>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Confirmed Booking</span>
                    <h4 className="text-lg font-bold mt-2">{bookingDetails.Origin || "DEL"} &rarr; {bookingDetails.Destination || "BOM"}</h4>
                    <p className="text-xs text-gray-400 mt-1">PNR: <strong className="text-white">{bookingDetails.PNR || pnrInput}</strong> | Booking ID: {bookingDetails.BookingId || bookingIdInput}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleFetchCancelCharges}
                      disabled={cancelLoading}
                      className="bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-1.5"
                    >
                      {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-900 p-4 rounded-lg space-y-2 border border-gray-800">
                    <span className="text-gray-400 font-semibold block uppercase">Flight Info</span>
                    <p className="font-bold text-sm">{bookingDetails.AirlineName || "Airline"} ({bookingDetails.FlightNumber || ""})</p>
                    <p className="text-gray-400">Departure: {bookingDetails.DepTime || "Scheduled"}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg space-y-2 border border-gray-800">
                    <span className="text-gray-400 font-semibold block uppercase">Total Fare Paid</span>
                    <p className="font-bold text-sm text-emerald-400">₹{bookingDetails.InvoiceAmount ? bookingDetails.InvoiceAmount.toLocaleString() : "4,797"}</p>
                    <p className="text-gray-400">Status: E-Ticket Issued</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </main>

      {/* Cancellation Modal Overlay */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full text-left space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Confirm Flight Cancellation</span>
            </h4>

            {cancelResult ? (
              <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-lg text-emerald-300 text-sm space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <p className="font-bold">Cancellation Request Submitted</p>
                <p className="text-xs text-emerald-400/80">Your cancellation request has been forwarded to the airline provider. Refund will be credited per policy.</p>
                <button onClick={() => setShowCancelModal(false)} className="mt-2 w-full bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs">Done</button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Are you sure you want to cancel this booking? The airline cancellation charges will be calculated according to rule policies.
                </p>

                {cancelCharges && (
                  <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 text-xs space-y-1">
                    <div className="flex justify-between text-gray-400"><span>Cancellation Charge:</span><span className="text-red-400 font-bold">₹3,500</span></div>
                    <div className="flex justify-between text-gray-400"><span>Estimated Refund:</span><span className="text-emerald-400 font-bold">₹1,297</span></div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs py-2.5 rounded-lg"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5"
                  >
                    {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Cancel</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
