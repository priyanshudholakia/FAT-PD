import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import FlightsResultPage from "./pages/flights/result/ResultPage";
import FlightBookingPage from "./pages/flights/booking/BookingPage";
import PaymentPage from "./common/PaymentPage";
import FlightBookingSuccessPage from "./pages/flights/booking/FlightBookingSuccessPage";
import BookingFailurePage from "./common/BookingFailurePage";
import ComingSoonPage from "./pages/coming-soon/ComingSoonPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HomePage (includes header, flight search, hero, cards & footer) */}
        <Route path="/" element={<HomePage />} />
        
        {/* Active Flights module routes */}
        <Route path="/flights" element={<FlightsResultPage />} />
        <Route path="/flights/book" element={<FlightBookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/flights/booking-success" element={<FlightBookingSuccessPage />} />
        <Route path="/booking-failure" element={<BookingFailurePage />} />

        {/* Dedicated Coming Soon Route */}
        <Route path="/coming-soon" element={<ComingSoonPage />} />

        {/* Incomplete module routes redirected to Coming Soon */}
        <Route path="/hotels" element={<Navigate to="/coming-soon?feature=Hotels" replace />} />
        <Route path="/hotels/*" element={<Navigate to="/coming-soon?feature=Hotels" replace />} />
        
        <Route path="/packages" element={<Navigate to="/coming-soon?feature=Holidays%20%26%20Packages" replace />} />
        <Route path="/packages/*" element={<Navigate to="/coming-soon?feature=Holidays%20%26%20Packages" replace />} />
        <Route path="/holidays" element={<Navigate to="/coming-soon?feature=Holidays" replace />} />
        <Route path="/holidays/*" element={<Navigate to="/coming-soon?feature=Holidays" replace />} />
        
        <Route path="/visa" element={<Navigate to="/coming-soon?feature=Visa%20Services" replace />} />
        <Route path="/login" element={<Navigate to="/coming-soon?feature=User%20Login" replace />} />
        <Route path="/signup" element={<Navigate to="/coming-soon?feature=User%20Registration" replace />} />
        <Route path="/dashboard" element={<Navigate to="/coming-soon?feature=User%20Dashboard" replace />} />
        
        {/* Catch-all route for any other unhandled paths */}
        <Route path="*" element={<Navigate to="/coming-soon?feature=Page" replace />} />
      </Routes>
    </BrowserRouter>
  );
}