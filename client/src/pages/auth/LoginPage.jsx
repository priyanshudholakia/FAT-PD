/**
 * ============================================================================
 * PATH: client/src/pages/auth/LoginPage.jsx
 * DESCRIPTION: User authentication login screen
 * 
 * FIGMA MATCH: Input credentials forms and submit hooks.
 * ============================================================================
 */

import React from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";

export default function LoginPage() {
  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-red-500 font-sans tracking-wide">Sign In</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
            </div>
            <button type="submit" className="w-full bg-red-650 hover:bg-red-700 py-3 rounded-lg font-bold transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
