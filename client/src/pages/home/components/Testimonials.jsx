/**
 * ============================================================================
 * PATH: client/src/pages/home/components/Testimonials.jsx
 * DESCRIPTION: Redesigned Customer feedback reviews running in an infinite
 *              horizontal loop matching Figma layout exactly.
 * ============================================================================
 */

import React from "react";
export default function Testimonials() {
  const reviews = [
    {
      name: "Karan",
      date: "1 week ago",
      quote: "My buying experience is so nice, and received me very politely. Riding experience is also very good. Very good performance. I never experienced such a kind of performance. Very good service.",
      avatar: "/assets/home/testimonials/icons/user1.svg"
    },
    {
      name: "Arpit Roy",
      date: "2 weeks ago",
      quote: "Booked our entire Bali honeymoon - flights, hotel, transfers - all in one place. Absolutely seamless and saved a lot of time. The helpdesk was also very responsive!",
      avatar: "/assets/home/testimonials/icons/user2.svg"
    },
    {
      name: "Catherine",
      date: "10 days ago",
      quote: "I love my e-bike and the customer service is excellent. They respond in a timely manner with loads of information about e-bikes, accessories and maintenance information.",
      avatar: "/assets/home/testimonials/icons/user3.svg"
    },
    {
      name: "Arpit Roy",
      date: "2 weeks ago",
      quote: "Booked our entire Bali honeymoon - flights, hotel, transfers - all in one place. Absolutely seamless and saved a lot of time. The helpdesk was also very responsive!",
      avatar: "/assets/home/testimonials/icons/user2.svg"
    }
  ];

  // Duplicate reviews to create a seamless infinite scrolling marquee look
  const doubledReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="bg-white py-14 font-sans overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* Header Block */}
        <div className="text-left mb-8">
          <h2 className="text-[32px] font-bold font-satoshi text-[#1A1A1A] tracking-tight">Customer Testimonials</h2>
          <p className="text-[#6B6B6B] text-[16px] font-medium font-quicksand mt-1">Best rates at 50,000+ properties across India</p>
        </div>

        {/* Infinite scrolling marquee wrapper */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="animate-marquee hover:[animation-play-state:paused]">
            {doubledReviews.map((rev, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 md:w-[380px] mx-3 flex flex-col justify-between"
              >
                {/* Quote bubble container */}
                <div className="bg-white border border-gray-200/70 p-6 rounded-2xl shadow-xs relative text-left">
                  <p className="font-inter text-[#1A1A1A] text-[15px] font-medium leading-relaxed min-h-[120px]">
                    "{rev.quote}"
                  </p>

                  {/* 5 Rating Stars */}
                  <div className="flex items-center text-[#FFB400] text-xs mt-4.5 space-x-0.5">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <img key={starIdx} src="/assets/home/hotels/icons/star.svg" alt="Star" className="w-[16px] h-[16px] object-contain" />
                    ))}
                  </div>
                </div>

                {/* User profile */}
                <div className="flex items-center space-x-3.5 mt-4 px-1 text-left">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="font-satoshi font-bold text-[16px] text-[#1A1A1A]">{rev.name}</h4>
                    <span className="font-inter text-[12px] font-normal text-[#666666] block mt-0.5">{rev.date}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
