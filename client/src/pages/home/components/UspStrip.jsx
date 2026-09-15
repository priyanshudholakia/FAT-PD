/**
 * ============================================================================
 * PATH: client/src/pages/home/components/UspStrip.jsx
 * DESCRIPTION: Redesigned trust credentials horizontal bar using Satoshi font
 *              and primary red background.
 * ============================================================================
 */

import React from "react";


export default function UspStrip() {
  return (
    <section
      style={{ background: "linear-gradient(270deg, #FF2D1A 0.01%, #991B10 99.99%)" }}
      className="text-white py-5 shadow-inner font-satoshi"
    >
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-[18.94px] font-medium tracking-wide">

        {/* Support */}
        <div className="flex items-center justify-center space-x-2">
          <img src="/assets/home/usp/icons/support.svg" alt="Support" className="w-[22px] h-[22px] brightness-0 invert" />
          <span className="text-white">24/7 Customer Support</span>
        </div>

        {/* Secure Payments */}
        <div className="flex items-center justify-center space-x-2">
          <img src="/assets/home/usp/icons/payments.svg" alt="Secure" className="w-[22px] h-[22px] brightness-0 invert" />
          <span className="text-white">100% Secure Payments</span>
        </div>

        {/* Best Price */}
        <div className="flex items-center justify-center space-x-2">
          <img src="/assets/home/usp/icons/price.svg" alt="Price" className="w-[22px] h-[22px] brightness-0 invert" />
          <span className="text-white">Best Price Guarantee</span>
        </div>

        {/* Confirmation */}
        <div className="flex items-center justify-center space-x-2">
          <img src="/assets/home/usp/icons/confirmation.svg" alt="Confirmation" className="w-[22px] h-[22px] brightness-0 invert" />
          <span className="text-white">Instant Confirmation</span>
        </div>

        {/* Happy Customers */}
        <div className="flex items-center justify-center space-x-2 col-span-2 md:col-span-1">
          <img src="/assets/home/usp/icons/travellers.svg" alt="Travellers" className="w-[22px] h-[22px] brightness-0 invert" />
          <span className="text-white">5M+ Happy Travellers</span>
        </div>

      </div>
    </section>
  );
}
