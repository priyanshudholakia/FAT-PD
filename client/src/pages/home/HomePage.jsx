/**
 * ============================================================================
 * PATH: client/src/pages/home/HomePage.jsx
 * ASSIGNED TO: Developer 1 (Lead / You)
 * DESCRIPTION: Modular, real-world homepage dashboard. Imports components cleanly.
 * ============================================================================
 */

import React from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import HeroSection from "./components/HeroSection";
import UspStrip from "./components/UspStrip";
import PopularDestinations from "./components/PopularDestinations";
import PopularRoutes from "./components/PopularRoutes";
import HotelDeals from "./components/HotelDeals";
import WhyChooseUs from "./components/WhyChooseUs";
import Testimonials from "./components/Testimonials";
import Faqs from "./components/Faqs";
import AppDownloadBanner from "./components/AppDownloadBanner";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col font-sans antialiased">
      {/* 1. Global Decoupled Header */}
      <Header />

      {/* Main page content sections */}
      <main className="flex-grow">
        {/* 2. State-aware Hero Console */}
        <HeroSection />

        {/* 3. Horizontal Trust Strip */}
        <UspStrip />

        {/* 4. Curated Holiday destinations */}
        <PopularDestinations />

        {/* 5. Popular Flight Routes list */}
        <PopularRoutes />

        {/* 6. Top Hotel Deals grid */}
        <HotelDeals />

        {/* 7. Why Choose Us guarantees grid */}
        <WhyChooseUs />

        {/* 8. Testimonials feedback cards */}
        <Testimonials />

        {/* 9. Interactive FAQ accordion cards */}
        <Faqs />

        {/* 10. App promotion banner */}
        <AppDownloadBanner />
      </main>

      {/* 11. Global mountain silhouette footer */}
      <Footer />
    </div>
  );
}
