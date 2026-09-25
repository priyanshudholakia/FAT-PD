/**
 * ============================================================================
 * PATH: client/src/pages/visa/VisaRedirectPage.jsx
 * ASSIGNED TO: Developer 4
 * DESCRIPTION: Visa Assistance partner redirection screen
 * 
 * FIGMA PARTS:
 * 1. Explanatory banner showing partner services (AskVisas).
 * 2. Redirect action prompt button.
 * ============================================================================
 */

import React from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function VisaRedirectPage() {
  const handleRedirect = () => {
    window.open("https://askvisas.in/?utm_source=flyanytrip", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-2xl mx-auto px-4 py-16 text-center flex flex-col justify-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          🛡️
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">Visa Assistance Services</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          We partner with <strong>AskVisas</strong> to process visa documents and applications securely. Clicking below will open their system in a new tab.
        </p>
        <button 
          onClick={handleRedirect} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all"
        >
          Proceed to AskVisas.in
        </button>
      </main>

      <Footer />
    </div>
  );
}
