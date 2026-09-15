/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/ResultPage.jsx
 * DESCRIPTION: Main assembler page for flight search results.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlignLeft, ChevronDown, Zap, Star, Tag, Loader2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Global Layout Components (Unmodified)
import Header from "../../../common/Header";
import Footer from "../../../common/Footer";

// Modular Section Components
import SearchModifier from "./components/SearchModifier";
import SearchSummary from "./components/SearchSummary";
import Filters from "./components/Filters";
import FareCalendar from "./components/FareCalendar";
import Card from "./components/Card";
import FareModal from "./components/FareModal";
import { getPerAdultFare, getTotalTravellerCount } from "../../../utils/fareBreakdown";

export default function ResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search parameters from URL query string
  const from = searchParams.get("from") || "DEL";
  const to = searchParams.get("to") || "BOM";
  const depDate = searchParams.get("depDate") || "";
  const retDate = searchParams.get("retDate") || "";
  const isoneway = searchParams.get("isoneway") || "Yes";
  const adults = searchParams.get("adults") || "1";
  const children = searchParams.get("children") || "0";
  const infants = searchParams.get("infants") || "0";
  const cabinClass = searchParams.get("class") || "Economy";

  // Modal selector states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  // State for fare type selections
  const [fareType, setFareType] = useState("regular");

  // State for sorting: 'cheapest', 'fastest', 'best'
  const [sortBy, setSortBy] = useState("cheapest");

  // State for active calendar date index
  const [selectedDateIdx, setSelectedDateIdx] = useState(3); // Dec 15 Sun

  // API states
  const [flights, setFlights] = useState([]);
  const [traceId, setTraceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState(null);

  // Calendar Fare States
  const [calendarCenterDate, setCalendarCenterDate] = useState(depDate);
  const [calendarFares, setCalendarFares] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Keep calendar center date in sync when search departure date updates
  useEffect(() => {
    if (depDate) {
      setCalendarCenterDate(depDate);
    }
  }, [depDate]);

  // Fetch calendar fares when route or visible calendar range changes (crosses boundaries)
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoadingCalendar(true);
        const center = new Date(calendarCenterDate || depDate);
        center.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Align with FareCalendar.jsx start and end date calculation
        let startDate = new Date(center);
        startDate.setDate(center.getDate() - 3);
        if (startDate < today) {
          startDate = new Date(today);
        }

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const getAdivahaSafeDate = (dObj) => {
          const todayObj = new Date();
          todayObj.setHours(0, 0, 0, 0);
          if (dObj.getMonth() === todayObj.getMonth() && dObj.getFullYear() === todayObj.getFullYear()) {
            const y = todayObj.getFullYear();
            const m = String(todayObj.getMonth() + 1).padStart(2, "0");
            const d = String(todayObj.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
          } else {
            const y = dObj.getFullYear();
            const m = String(dObj.getMonth() + 1).padStart(2, "0");
            return `${y}-${m}-01`;
          }
        };

        const startMonthStr = getAdivahaSafeDate(startDate);
        const endMonthStr = getAdivahaSafeDate(endDate);

        // 1. Fetch month(s) covering the active 7 days immediately, and the single-day update for the selected date
        const primaryReqs = [
          axios.post(`${API_BASE_URL}/flights/calendar-fares`, {
            From_IATACODE: from,
            To_IATACODE: to,
            departure_date: startMonthStr,
            flights_category: cabinClass
          })
        ];

        if (startMonthStr !== endMonthStr) {
          primaryReqs.push(
            axios.post(`${API_BASE_URL}/flights/calendar-fares`, {
              From_IATACODE: from,
              To_IATACODE: to,
              departure_date: endMonthStr,
              flights_category: cabinClass
            })
          );
        }

        // Add the single day update calendar fare request for the selected date to resolve immediately
        primaryReqs.push(
          axios.post(`${API_BASE_URL}/flights/update-calendar-fare`, {
            From_IATACODE: from,
            To_IATACODE: to,
            departure_date: depDate,
            flights_category: cabinClass
          }).catch(err => {
            console.error("Error fetching single day calendar fare on load:", err);
            return null;
          })
        );

        const primaryResponses = await Promise.all(primaryReqs);
        const faresMap = {};

        primaryResponses.forEach(res => {
          if (res && res.data?.responseData?.Response?.SearchResults) {
            res.data.responseData.Response.SearchResults.forEach(item => {
              const datePart = item.DepartureDate.split("T")[0];
              faresMap[datePart] = Math.max(item.Fare || 0, item.BaseFare || 0);
            });
          }
        });

        // Set the active month's fares (including the updated selected date fare) instantly and stop loading
        setCalendarFares(prev => ({ ...prev, ...faresMap }));
        setLoadingCalendar(false);

        // 2. Fetch adjacent months in background for caching
        const prevMonth = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        const nextMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);
        const prevMonthStr = getAdivahaSafeDate(prevMonth);
        const nextMonthStr = getAdivahaSafeDate(nextMonth);

        const bgReqs = [];
        if (prevMonthStr !== startMonthStr && prevMonthStr !== endMonthStr) {
          bgReqs.push(
            axios.post(`${API_BASE_URL}/flights/calendar-fares`, {
              From_IATACODE: from,
              To_IATACODE: to,
              departure_date: prevMonthStr,
              flights_category: cabinClass
            })
          );
        }
        if (nextMonthStr !== startMonthStr && nextMonthStr !== endMonthStr) {
          bgReqs.push(
            axios.post(`${API_BASE_URL}/flights/calendar-fares`, {
              From_IATACODE: from,
              To_IATACODE: to,
              departure_date: nextMonthStr,
              flights_category: cabinClass
            })
          );
        }

        if (bgReqs.length > 0) {
          Promise.all(bgReqs).then(responses => {
            const bgFaresMap = {};
            responses.forEach(res => {
              if (res.data?.responseData?.Response?.SearchResults) {
                res.data.responseData.Response.SearchResults.forEach(item => {
                  const datePart = item.DepartureDate.split("T")[0];
                  bgFaresMap[datePart] = Math.max(item.Fare || 0, item.BaseFare || 0);
                });
              }
            });
            setCalendarFares(prev => ({ ...prev, ...bgFaresMap }));
          }).catch(err => {
            console.error("Background calendar fares fetch error:", err);
          });
        }

      } catch (err) {
        console.error("Error fetching calendar fares:", err);
        setLoadingCalendar(false);
      }
    };
    if (from && to && calendarCenterDate) {
      fetchCalendar();
    }
  }, [from, to, calendarCenterDate]);

  // Filter States
  const [activeFilters, setActiveFilters] = useState({
    stops: [],
    airlines: [],
    maxPrice: null,
    depTimes: [],
    arrTimes: []
  });

  const [priceLimits, setPriceLimits] = useState({ min: 1000, max: 15000 });

  // Update price limits dynamically when flights load
  useEffect(() => {
    if (flights.length > 0) {
      const prices = flights.map(f => f.priceRaw);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceLimits({ min, max });
      setActiveFilters(prev => ({
        ...prev,
        maxPrice: prev.maxPrice === null ? max : prev.maxPrice
      }));

      // Inject the current date's true minimum fare into the calendar
      // to fallback when Adivaha's GetCalendarFares API fails in the sandbox
      setCalendarFares(prev => ({
        ...prev,
        [depDate]: min
      }));
    } else {
      // Reset price slider when no flights are found
      setPriceLimits({ min: 0, max: 0 });
      setActiveFilters(prev => ({ ...prev, maxPrice: null }));

      // Clear the current date's fare from the calendar if it's empty
      setCalendarFares(prev => ({
        ...prev,
        [depDate]: null
      }));
    }
  }, [flights, depDate]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      setActiveFilters({
        stops: [],
        airlines: [],
        maxPrice: null,
        depTimes: [],
        arrTimes: []
      });
      try {
        const body = {
          adults,
          children,
          infants,
          isoneway,
          From_IATACODE: from,
          To_IATACODE: to,
          departure_date: depDate,
          return_date: retDate,
          flights_category: cabinClass
        };
        const response = await axios.post(`${API_BASE_URL}/flights/search`, body);

        const responseData = response.data;
        if (responseData && responseData.responseData?.Response?.Results) {
          const apiTraceId = responseData.responseData.Response.TraceId || "";
          setTraceId(apiTraceId);
          const rawResults = responseData.responseData.Response.Results[0] || [];

          // Group raw search results by flight itinerary signature to capture all fare tiers for each flight
          const groupedMap = {};
          rawResults.forEach((option) => {
            const segs = option.Segments?.[0] || [];
            const key = segs.map(s => `${s.Airline?.AirlineCode}${s.Airline?.FlightNumber}_${s.Origin?.DepTime}_${s.Destination?.ArrTime}`).join('|');
            if (!groupedMap[key]) groupedMap[key] = [];
            groupedMap[key].push(option);
          });

          // Map each unique itinerary to a card
          const mapped = Object.values(groupedMap).map((fareOptionsGroup, index) => {
            // Sort fare options by fare ascending
            fareOptionsGroup.sort((a, b) => (a.Fare?.PublishedFare || 0) - (b.Fare?.PublishedFare || 0));
            const option = fareOptionsGroup[0]; // Cheapest option for main card display

            const segments = option.Segments?.[0] || [];
            const firstLeg = segments[0] || {};
            const lastLeg = segments[segments.length - 1] || firstLeg;

            const airlineCode = firstLeg.Airline?.AirlineCode || "AI";
            const airlineName = firstLeg.Airline?.AirlineName || "Unknown Airline";
            const flightNumber = firstLeg.Airline?.FlightNumber || "";

            const formatTime = (isoString) => {
              if (!isoString) return "--:--";
              const parts = isoString.split("T");
              if (parts[1]) return parts[1].substring(0, 5);
              return "--:--";
            };

            const totalDurationMin = segments.reduce((sum, seg) => sum + (seg.Duration || 0) + (seg.GroundTime || 0), 0);
            const formatDuration = (mins) => {
              const h = Math.floor(mins / 60);
              const m = mins % 60;
              if (h > 0 && m === 0) return `${h}h`;
              if (h === 0) return `${m}m`;
              return `${h}h ${m}m`;
            };

            const logo = airlineCode ? `https://images.kiwi.com/airlines/64/${airlineCode.toUpperCase()}.png` : "https://images.kiwi.com/airlines/64/6E.png";

            const priceVal = option.Fare?.PublishedFare || 0;
            const priceStr = `₹${Math.round(priceVal).toLocaleString()}`;

            // Card.jsx labels this figure "per adult" — it must actually be
            // the per-adult price, not the combined total for every
            // adult/child/infant on the search. Adivaha's FareBreakdown
            // array (present on every search result option) gives the
            // exact base+tax total charged for each PassengerType, so the
            // true per-adult fare is that Adult row's total divided by the
            // adult count. Previously `priceVal` (the grand total for ALL
            // passengers) was shown here directly, so a 2-adult search
            // displayed the 2-adult total mislabeled as a single "per adult"
            // price.
            const totalTravellers = getTotalTravellerCount(
              option,
              Number(adults) + Number(children) + Number(infants) || 1
            );
            const perAdultFareVal = getPerAdultFare(option, priceVal);
            const perAdultPriceStr = `₹${Math.round(perAdultFareVal).toLocaleString()}`;

            let stopsText = "Non-stop";
            if (segments.length === 2) stopsText = "1 Stop";
            else if (segments.length > 2) stopsText = `${segments.length - 1} Stops`;

            // Baggage/CabinBaggage come straight from the segment as
            // Adivaha reports them — they genuinely vary per fare/airline
            // (e.g. 15 KG vs 20 KG vs unspecified for a particular NDC
            // fare), so a fixed "15 KG"/"7 KG" fallback here was silently
            // showing a fabricated allowance whenever the API's own field
            // was null/absent (confirmed: CabinBaggage comes back null on
            // several real Adivaha search results). When the API doesn't
            // report a value, say so honestly instead of inventing one.
            const baggage = firstLeg.Baggage || null;
            const cabinBaggage = firstLeg.CabinBaggage || null;
            const isRefundable = option.IsRefundable;

            // Calculate day difference
            const depDateStr = firstLeg.Origin?.DepTime?.split("T")[0];
            const arrDateStr = lastLeg.Destination?.ArrTime?.split("T")[0];
            let dayDiff = 0;
            if (depDateStr && arrDateStr) {
              const dDate = new Date(depDateStr);
              const aDate = new Date(arrDateStr);
              const timeDiff = aDate.getTime() - dDate.getTime();
              dayDiff = Math.max(0, Math.round(timeDiff / (1000 * 3600 * 24)));
            }

            return {
              id: option.ResultIndex || index,
              logo,
              airline: airlineName,
              code: `${airlineCode}-${flightNumber}`,
              depTime: formatTime(firstLeg.Origin?.DepTime),
              arrTime: formatTime(lastLeg.Destination?.ArrTime),
              fromCode: firstLeg.Origin?.AirportCode || firstLeg.Origin?.Airport?.AirportCode || from,
              toCode: lastLeg.Destination?.AirportCode || lastLeg.Destination?.Airport?.AirportCode || to,
              duration: formatDuration(totalDurationMin),
              stops: stopsText,
              price: perAdultPriceStr,
              priceRaw: priceVal,
              perAdultPriceRaw: perAdultFareVal,
              totalPriceStr: priceStr,
              totalTravellers,
              durationRaw: totalDurationMin,
              save: isRefundable ? "Refundable" : "Non-Refundable",
              // "Not specified" (not a fabricated weight) whenever Adivaha's
              // own Baggage/CabinBaggage field is null/absent for this fare.
              flexi: baggage ? `Baggage: ${baggage}` : "Baggage: Not specified by airline",
              business: cabinBaggage ? `Cabin: ${cabinBaggage}` : "Cabin: Not specified by airline",
              badge: null,
              dayDiff,
              rawOption: option,
              allFareOptions: fareOptionsGroup
            };
          });

          setFlights(mapped);

          // Do not align or override the calendar fare with the live flight search results.
          // Keep the calendar fare exactly as returned by the calendar api.
        } else {
          // If response status is invalid or no flights
          setFlights([]);
          if (responseData && responseData.status === 101) {
            setError(responseData.message || "Failed to retrieve flights.");
          }
        }
      } catch (err) {
        console.error("Flights fetch error:", err);
        setError("Unable to load flight options. Please try another search.");
      } finally {
        setIsExiting(true);
        setTimeout(() => {
          setLoading(false);
          setIsExiting(false);
        }, 600);
      }
    };

    fetchFlights();
  }, [from, to, depDate, retDate, isoneway, adults, children, infants]);

  // Filter flights based on active selections
  const filteredFlights = flights.filter((flight) => {
    // 1. Filter by Stops
    if (activeFilters.stops.length > 0) {
      if (!activeFilters.stops.includes(flight.stops)) {
        return false;
      }
    }

    // 2. Filter by Airlines
    if (activeFilters.airlines.length > 0) {
      const airlineCode = flight.code.split("-")[0];
      if (!activeFilters.airlines.includes(airlineCode)) {
        return false;
      }
    }

    // 3. Filter by Price
    if (activeFilters.maxPrice !== null) {
      if (flight.priceRaw > activeFilters.maxPrice) {
        return false;
      }
    }

    // 4. Filter by Departure Time
    if (activeFilters.depTimes.length > 0) {
      const hour = parseInt(flight.depTime.split(":")[0], 10);
      let timePeriod = "";
      if (hour >= 0 && hour < 6) timePeriod = "early";
      else if (hour >= 6 && hour < 12) timePeriod = "morning";
      else if (hour >= 12 && hour < 18) timePeriod = "afternoon";
      else if (hour >= 18 && hour < 24) timePeriod = "evening";

      if (!activeFilters.depTimes.includes(timePeriod)) {
        return false;
      }
    }

    // 5. Filter by Arrival Time
    if (activeFilters.arrTimes.length > 0) {
      const hour = parseInt(flight.arrTime.split(":")[0], 10);
      let timePeriod = "";
      if (hour >= 0 && hour < 6) timePeriod = "early";
      else if (hour >= 6 && hour < 12) timePeriod = "morning";
      else if (hour >= 12 && hour < 18) timePeriod = "afternoon";
      else if (hour >= 18 && hour < 24) timePeriod = "evening";

      if (!activeFilters.arrTimes.includes(timePeriod)) {
        return false;
      }
    }

    return true;
  });

  // Handle in-memory sorting of filtered flights
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === "cheapest") {
      return a.priceRaw - b.priceRaw;
    }
    if (sortBy === "fastest") {
      return a.durationRaw - b.durationRaw;
    }
    // "best" sorts by cheapest for simplicity
    return a.priceRaw - b.priceRaw;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-between font-inter text-left">

      {/* 1. Global Header block */}
      <Header isSticky={false} />

      {/* 2. Interactive Search Modifier panel */}
      <div className={`relative transition-opacity duration-200 ${loading ? "opacity-60" : ""}`}>
        <SearchModifier
          fareType={fareType}
          setFareType={setFareType}
          externalCalendarFares={calendarFares}
          setExternalCalendarFares={setCalendarFares}
        />
        {loading && (
          <div className="absolute inset-0 bg-transparent cursor-not-allowed z-50 pointer-events-auto" />
        )}
      </div>

      {/* 3. Sticky Context Summary bar */}
      {/* <SearchSummary 
        fromCode={from}
        toCode={to}
        depDate={depDate}
        adults={adults}
        children={children}
        infants={infants}
        cabinClass={cabinClass}
        isOneway={isoneway}
        onModify={() => navigate("/")} 
      /> */}
      {/* 4. Page Content Grid Layout or Centered Loading Screen */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-28 select-none w-full overflow-hidden">
          <div className="text-center space-y-6">            {/* Plane gliding animation (larger size, no line, smooth loop) */}
            <div className="relative w-full h-24 mx-auto flex items-center justify-center">
              {/* Flying plane */}
              <motion.div
                animate={isExiting ? { x: "100vw", y: -180, scale: 0.9, rotate: -22 } : { x: 0, y: [-8, 8, -8], rotate: [-2, 2, -2] }}
                transition={isExiting ? { duration: 0.8, ease: "easeIn" } : {
                  y: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut"
                  },
                  rotate: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: "easeInOut"
                  }
                }}
                className="absolute"
              >
                <img
                  src="/assets/loader/airplane-transparent.webp"
                  alt="Loading plane"
                  className="w-40 h-auto object-contain brightness-105"
                  style={{ transform: "rotateY(180deg)" }}
                />
              </motion.div>
            </div>

            {/* Simple MMT-style text */}
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-[#272727] tracking-tight">
                Hold on, we're fetching flights for you
              </h2>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Filter sidebar (collapsible on mobile) */}
          {showFilters && (
            <div className="lg:col-span-3">
              <Filters
                flights={flights}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                priceLimits={priceLimits}
              />
            </div>
          )}

          {/* Right Column: Date selector + Flight lists */}
          <main className={`${showFilters ? "lg:col-span-9" : "lg:col-span-12"} space-y-4`}>

            {/* Top Sort / Control row */}
            <div className="bg-white border border-[#EAEAEA] p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-[#EAEAEA] hover:bg-gray-50 text-[#272727] font-extrabold px-4.5 py-2 rounded-xl text-xs transition-all flex items-center space-x-2 shadow-2xs select-none cursor-pointer"
              >
                <AlignLeft className="w-3.5 h-3.5 text-[#272727] stroke-[2.5]" />
                <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
              </button>

              <span className="text-[11.5px] font-bold text-gray-400 tracking-tight">
                {`${sortedFlights.length} flight${sortedFlights.length !== 1 ? "s" : ""} found`}
              </span>

              <div className="flex items-center space-x-2.5">
                <span className="text-[11px] font-bold text-[#272727] uppercase tracking-wider select-none">Sort By:</span>
                <div className="flex space-x-1.5 bg-[#FAFAFA] p-1 rounded-xl border border-[#EAEAEA]">
                  {[
                    { id: "cheapest", label: "Cheapest", icon: <Tag className="w-3.5 h-3.5 stroke-[2.5]" /> },
                    { id: "fastest", label: "Fastest", icon: <Zap className="w-3.5 h-3.5 stroke-[2.5]" /> },
                    { id: "best", label: "Best", icon: <Star className="w-3.5 h-3.5 stroke-[2.5]" /> }
                  ].map((sortOption) => (
                    <button
                      key={sortOption.id}
                      onClick={() => setSortBy(sortOption.id)}
                      className={`px-4.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${sortBy === sortOption.id
                        ? "bg-[#FF2D1A] text-white shadow-xs"
                        : "bg-transparent text-[#272727] hover:text-black hover:bg-gray-50/50"
                        }`}
                    >
                      {sortOption.icon && (
                        <span className={sortBy === sortOption.id ? "text-white" : "text-[#272727]"}>
                          {sortOption.icon}
                        </span>
                      )}
                      <span>{sortOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Fare calendar selector */}
            <FareCalendar
              depDate={depDate}
              calendarCenterDate={calendarCenterDate}
              calendarFares={calendarFares}
              onDateSelect={(newDateStr) => {
                // 1. Trigger flight search immediately by navigating
                navigate(`/flights?from=${from}&to=${to}&depDate=${newDateStr}&retDate=${retDate}&isoneway=${isoneway}&adults=${adults}&children=${children}&infants=${infants}&class=${cabinClass}`);

                // 2. Fetch and update the calendar fare of that day asynchronously
                axios.post(`${API_BASE_URL}/flights/update-calendar-fare`, {
                  From_IATACODE: from,
                  To_IATACODE: to,
                  departure_date: newDateStr,
                  flights_category: cabinClass
                }).then(res => {
                  if (res.data?.responseData?.Response?.SearchResults) {
                    const faresMap = {};
                    res.data.responseData.Response.SearchResults.forEach(item => {
                      const datePart = item.DepartureDate.split("T")[0];
                      faresMap[datePart] = Math.max(item.Fare || 0, item.BaseFare || 0);
                    });
                    setCalendarFares(prev => ({
                      ...prev,
                      ...faresMap
                    }));
                  }
                }).catch(err => {
                  console.error("Error updating calendar fare of day:", err);
                });
              }}
              onCenterDateChange={setCalendarCenterDate}
            />

            {/* Listing items or Error states */}
            <div className="space-y-4 pt-1">
              {error ? (
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
                  <p className="font-extrabold text-[15px] text-gray-800">{error}</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-[#FF2D1A] hover:bg-red-750 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Return to Home
                  </button>
                </div>
              ) : sortedFlights.length === 0 ? (
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
                  <p className="font-extrabold text-[15px] text-gray-800">No flights found for this route and date.</p>
                  <p className="text-xs text-gray-400 font-medium">Try searching for a different date or another route.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-[#FF2D1A] hover:bg-red-750 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    Modify Search
                  </button>
                </div>
              ) : (
                sortedFlights.map((flight) => (
                  <Card
                    key={flight.id}
                    flight={flight}
                    onSelect={() => {
                      setSelectedFlight(flight);
                      setIsModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>

          </main>

        </div>
      )}

      {/* 5. Global Footer block */}
      {!loading && <Footer />}

      {/* Flight Fare Selection Modal Overlay */}
      {isModalOpen && selectedFlight && (
        <FareModal
          flight={selectedFlight}
          traceId={traceId}
          adults={adults}
          children={children}
          infants={infants}
          onClose={() => setIsModalOpen(false)}
          onContinue={(fare, quoteData) => {
            setIsModalOpen(false);
            // FareQuote returns a freshly validated fare option which includes its own ResultIndex.
            // Adivaha/TBO SSR requirement: ResultIndex sent to SSR MUST match the ResultIndex returned by FareQuote!
            const activeResultIndex = quoteData?.results?.ResultIndex || fare?.rawOption?.ResultIndex || selectedFlight.rawOption?.ResultIndex;
            // Prefer the TraceId echoed back by the live Fare Quote call (fetched
            // when the fare modal opened) over the original search TraceId.
            const activeTraceId = quoteData?.traceId || traceId;
            const urlQuery = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&depDate=${encodeURIComponent(depDate)}&adults=${adults}&children=${children}&infants=${infants}&traceId=${encodeURIComponent(activeTraceId || '')}&resultIndex=${encodeURIComponent(activeResultIndex || '')}`;
            navigate(`/flights/book?${urlQuery}`, {
              state: {
                flight: selectedFlight,
                fare,
                traceId: activeTraceId,
                resultIndex: activeResultIndex,
                quoteData,
                adults,
                children,
                infants
              }
            });
          }}
        />
      )}

    </div>
  );
}