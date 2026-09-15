import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../../common/Navbar";
import Footer from "../../common/Footer";
import { 
  Rocket, 
  Sparkles, 
  ArrowLeft, 
  Plane, 
  Compass, 
  Building2, 
  Palmtree, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  Clock,
  Layers,
  MapPin,
  HeartHandshake
} from "lucide-react";

export default function ComingSoonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const rawFeature = searchParams.get("feature") || searchParams.get("module") || "Feature";
  const featureName = rawFeature.charAt(0).toUpperCase() + rawFeature.slice(1);

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const getFeatureDetails = (feature) => {
    const f = feature.toLowerCase();
    if (f.includes("hotel")) {
      return {
        icon: <Building2 className="w-12 h-12 text-rose-400" />,
        tagline: "Unforgettable Stays & Luxury Resorts",
        desc: "We are carefully curating over 500,000+ top-rated hotels, boutique stays, and beach resorts with exclusive member discounts and zero cancellation fees.",
        estLaunch: "Q4 2026",
        badgeColor: "from-amber-500/20 to-rose-500/20 border-rose-500/30 text-rose-300"
      };
    } else if (f.includes("package") || f.includes("holiday") || f.includes("tour")) {
      return {
        icon: <Palmtree className="w-12 h-12 text-emerald-400" />,
        tagline: "Handcrafted Holiday Experience",
        desc: "All-inclusive vacation bundles featuring custom itineraries, local guides, transfers, and 24/7 dedicated travel concierge support are almost here.",
        estLaunch: "Q4 2026",
        badgeColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300"
      };
    } else if (f.includes("visa")) {
      return {
        icon: <ShieldCheck className="w-12 h-12 text-blue-400" />,
        tagline: "Hassle-Free Express Visa Assistance",
        desc: "Fast-track international travel with automated visa eligibility checks, document review, and end-to-end embassy appointment scheduling.",
        estLaunch: "Q4 2026",
        badgeColor: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300"
      };
    } else if (f.includes("login") || f.includes("sign") || f.includes("auth") || f.includes("account") || f.includes("dashboard")) {
      return {
        icon: <Sparkles className="w-12 h-12 text-purple-400" />,
        tagline: "Unified FlyAnyTrip Traveler Passport",
        desc: "Save traveler profiles, auto-fill passenger information, earn rewards points, and access instant one-click refunds from your personal dashboard.",
        estLaunch: "Coming Soon",
        badgeColor: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300"
      };
    } else {
      return {
        icon: <Compass className="w-12 h-12 text-amber-400" />,
        tagline: "Elevating Your Travel Journey",
        desc: "Our engineering team is putting final touches on this exclusive section to give you the fastest, most seamless travel booking engine.",
        estLaunch: "Q4 2026",
        badgeColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300"
      };
    }
  };

  const info = getFeatureDetails(featureName);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white font-sans selection:bg-red-500 selection:text-white relative">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-7 bg-slate-900/60 border border-slate-800 p-8 sm:p-12 rounded-2xl shadow-xl">
          
          {/* Feature Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-800/80 text-xs sm:text-sm font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{featureName} Section &bull; Under Development</span>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-red-400">
            {info.icon}
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              {featureName} is Coming Soon
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-300">
              {info.tagline}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed pt-1">
              {info.desc}
            </p>
          </div>

          {/* Email Subscription Box */}
          <div className="max-w-md mx-auto pt-2">
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs sm:text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! We will notify you once this feature is live.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email for launch updates"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF2D1A] hover:bg-red-600 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Notify Me</span>
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <Link
              to="/flights"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF2D1A] hover:bg-red-600 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plane className="w-4 h-4" />
              <span>Book Flights</span>
            </Link>

            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
