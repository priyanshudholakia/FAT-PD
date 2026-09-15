/**
 * ============================================================================
 * PATH: client/src/pages/home/components/HeroSection.jsx
 * DESCRIPTION: Hero aircraft banner with section-specific search inputs
 *              and full-width background images, matching Figma styles exactly.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Plus, Minus, Search, AlertTriangle, Calendar } from "lucide-react";
import axios from "axios";

const allAirports = [
  { code: "DEL", name: "Indira Gandhi International Airport", CityName: "Delhi", CountryName: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", CityName: "Mumbai", CountryName: "India" },
  { code: "BLR", name: "Kempegowda International Airport", CityName: "Bengaluru", CountryName: "India" },
  { code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", CityName: "Kolkata", CountryName: "India" },
  { code: "MAA", name: "Chennai International Airport", CityName: "Chennai", CountryName: "India" },
  { code: "HYD", name: "Rajiv Gandhi International Airport", CityName: "Hyderabad", CountryName: "India" },
  { code: "PNQ", name: "Pune Airport", CityName: "Pune", CountryName: "India" },
  { code: "GOI", name: "Dabolim Airport", CityName: "Goa", CountryName: "India" },
  { code: "GOX", name: "Manohar International Airport Mopa", CityName: "Goa", CountryName: "India" },
  { code: "COK", name: "Cochin International Airport", CityName: "Kochi", CountryName: "India" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", CityName: "Ahmedabad", CountryName: "India" },
  { code: "CCJ", name: "Calicut International Airport", CityName: "Kozhikode", CountryName: "India" },
  { code: "TRV", name: "Trivandrum International Airport", CityName: "Thiruvananthapuram", CountryName: "India" },
  { code: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", CityName: "Amritsar", CountryName: "India" },
  { code: "LKO", name: "Chaudhary Charan Singh International Airport", CityName: "Lucknow", CountryName: "India" },
  { code: "JAI", name: "Jaipur International Airport", CityName: "Jaipur", CountryName: "India" },
  { code: "SXR", name: "Sheikh ul-Alam International Airport", CityName: "Srinagar", CountryName: "India" },
  { code: "IXC", name: "Shaheed Bhagat Singh International Airport", CityName: "Chandigarh", CountryName: "India" },
  { code: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", CityName: "Guwahati", CountryName: "India" },
  { code: "PAT", name: "Jay Prakash Narayan Airport", CityName: "Patna", CountryName: "India" },
  { code: "BBI", name: "Biju Patnaik Airport", CityName: "Bhubaneswar", CountryName: "India" },
  { code: "IXR", name: "Birsa Munda Airport", CityName: "Ranchi", CountryName: "India" },
  { code: "RPR", name: "Swami Vivekananda Airport", CityName: "Raipur", CountryName: "India" },
  { code: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", CityName: "Nagpur", CountryName: "India" },
  { code: "IXB", name: "Bagdogra Airport", CityName: "Siliguri", CountryName: "India" },
  { code: "DXB", name: "Dubai International Airport", CityName: "Dubai", CountryName: "United Arab Emirates" },
  { code: "LHR", name: "Heathrow Airport", CityName: "London", CountryName: "United Kingdom" },
  { code: "SIN", name: "Changi Airport", CityName: "Singapore", CountryName: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi Airport", CityName: "Bangkok", CountryName: "Thailand" },
  { code: "DMK", name: "Don Mueang International Airport", CityName: "Bangkok", CountryName: "Thailand" },
  { code: "HND", name: "Haneda Airport", CityName: "Tokyo", CountryName: "Japan" },
  { code: "NRT", name: "Narita International Airport", CityName: "Tokyo", CountryName: "Japan" },
  { code: "JFK", name: "John F. Kennedy International Airport", CityName: "New York", CountryName: "United States" },
  { code: "LAX", name: "Los Angeles International Airport", CityName: "Los Angeles", CountryName: "United States" },
  { code: "SFO", name: "San Francisco International Airport", CityName: "San Francisco", CountryName: "United States" },
  { code: "ORD", name: "O'Hare International Airport", CityName: "Chicago", CountryName: "United States" },
  { code: "CDG", name: "Charles de Gaulle Airport", CityName: "Paris", CountryName: "France" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", CityName: "Amsterdam", CountryName: "Netherlands" },
  { code: "FRA", name: "Frankfurt Airport", CityName: "Frankfurt", CountryName: "Germany" },
  { code: "KUL", name: "Kuala Lumpur International Airport", CityName: "Kuala Lumpur", CountryName: "Malaysia" },
  { code: "CMB", name: "Bandaranaike International Airport", CityName: "Colombo", CountryName: "Sri Lanka" },
  { code: "MCT", name: "Muscat International Airport", CityName: "Muscat", CountryName: "Oman" },
  { code: "AUH", name: "Zayed International Airport", CityName: "Abu Dhabi", CountryName: "United Arab Emirates" },
  { code: "DOH", name: "Hamad International Airport", CityName: "Doha", CountryName: "Qatar" },
  { code: "SYD", name: "Kingsford Smith Airport", CityName: "Sydney", CountryName: "Australia" },
  { code: "MEL", name: "Melbourne Airport", CityName: "Melbourne", CountryName: "Australia" },
  { code: "YVR", name: "Vancouver International Airport", CityName: "Vancouver", CountryName: "Canada" },
  { code: "YYZ", name: "Toronto Pearson International Airport", CityName: "Toronto", CountryName: "Canada" }
];

const filterAirports = (query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();

  const matches = allAirports.filter(airport => {
    return (
      airport.code.toLowerCase().includes(q) ||
      airport.CityName.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q) ||
      airport.CountryName.toLowerCase().includes(q)
    );
  });

  return matches.sort((a, b) => {
    const aCode = a.code.toLowerCase();
    const bCode = b.code.toLowerCase();
    const aCity = a.CityName.toLowerCase();
    const bCity = b.CityName.toLowerCase();

    if (aCode === q && bCode !== q) return -1;
    if (bCode === q && aCode !== q) return 1;

    if (aCode.startsWith(q) && !bCode.startsWith(q)) return -1;
    if (bCode.startsWith(q) && !aCode.startsWith(q)) return 1;

    if (aCity.startsWith(q) && !bCity.startsWith(q)) return -1;
    if (bCity.startsWith(q) && !aCity.startsWith(q)) return 1;

    return 0;
  });
};

const getMergedAirports = (localList, apiList) => {
  const seen = new Set();
  const merged = [];

  localList.forEach(item => {
    seen.add(item.code.toUpperCase());
    merged.push(item);
  });

  apiList.forEach(item => {
    const code = item.code.toUpperCase();
    if (!seen.has(code)) {
      seen.add(code);
      merged.push({
        code: item.code,
        name: item.name,
        CityName: item.CityName || item.city_fullname?.split(",")[0] || "",
        CountryName: item.CountryName || item.city_fullname?.split(",")[1] || ""
      });
    }
  });

  return merged;
};

export default function HeroSection() {
  const navigate = useNavigate();
  const location = useLocation();

  // State for active tab: 'flights', 'hotels', 'holidays'
  const [activeTab, setActiveTab] = useState("flights");

  // State for flight sub-option radio buttons
  const [flightType, setFlightType] = useState("oneway");

  // Swap animation toggle state
  const [swapToggled, setSwapToggled] = useState(false);

  // Hotels and holidays sub-option radio states
  const [hotelType, setHotelType] = useState("domestic");
  const [holidayType, setHolidayType] = useState("domestic");

  // Flight search states
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [fromSearch, setFromSearch] = useState("Delhi / (DEL)");
  const [fromAirports, setFromAirports] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState({
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    country: "India"
  });
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);

  const [toSearch, setToSearch] = useState("Mumbai / (BOM)");
  const [toAirports, setToAirports] = useState([]);
  const [selectedTo, setSelectedTo] = useState({
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India"
  });
  const [isToOpen, setIsToOpen] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  // Helper to get date string in YYYY-MM-DD
  const getOffsetDateStr = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [departureDate, setDepartureDate] = useState(getOffsetDateStr(1)); // Tomorrow
  const [returnDate, setReturnDate] = useState(getOffsetDateStr(8)); // 7 days after tomorrow

  // Popular Indian/Global airports list when inputs are focused but empty
  const popularAirports = [
    { code: "DEL", name: "Indira Gandhi International Airport", CityName: "Delhi", CountryName: "India" },
    { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", CityName: "Mumbai", CountryName: "India" },
    { code: "BLR", name: "Kempegowda International Airport", CityName: "Bengaluru", CountryName: "India" },
    { code: "DXB", name: "Dubai International Airport", CityName: "Dubai", CountryName: "United Arab Emirates" },
    { code: "MAA", name: "Chennai International Airport", CityName: "Chennai", CountryName: "India" }
  ];

  // Travelers state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [isTravelerOpen, setIsTravelerOpen] = useState(false);
  const [isCabinDropdownOpen, setIsCabinDropdownOpen] = useState(false);

  // References for handling clicks outside dropdowns
  const travelerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const calendarRef = useRef(null);

  // Calendar Fare States
  const [isCalendarOpen, setIsCalendarOpen] = useState(null); // "departure" | "return" | null
  const [depCalendarFares, setDepCalendarFares] = useState({});
  const [retCalendarFares, setRetCalendarFares] = useState({});
  const [currentCalDate, setCurrentCalDate] = useState(new Date());

  // Fetch calendar fares for a specific month
  const fetchCalendarFaresForMonth = async (dateObj, direction = "departure") => {
    if (!selectedFrom?.code || !selectedTo?.code) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dateStr;
      if (dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const d = String(today.getDate()).padStart(2, "0");
        dateStr = `${y}-${m}-${d}`;
      } else {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        dateStr = `${y}-${m}-01`;
      }

      const fromCode = direction === "departure" ? selectedFrom.code : selectedTo.code;
      const toCode = direction === "departure" ? selectedTo.code : selectedFrom.code;

      const res = await axios.post(`${API_BASE_URL}/flights/calendar-fares`, {
        From_IATACODE: fromCode,
        To_IATACODE: toCode,
        departure_date: dateStr,
        flights_category: cabinClass
      });

      if (res.data?.responseData?.Response?.SearchResults) {
        const results = res.data.responseData.Response.SearchResults;
        const faresMap = {};
        results.forEach(item => {
          const datePart = item.DepartureDate.split("T")[0];
          faresMap[datePart] = {
            fare: Math.max(item.Fare || 0, item.BaseFare || 0),
            isLowest: item.IsLowestFareOfMonth
          };
        });
        if (direction === "departure") {
          setDepCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
        } else {
          setRetCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching calendar fares:", err);
    }
  };

  const fetchCalendarFareOfTheDay = async (dateStr, direction = "departure") => {
    if (!selectedFrom?.code || !selectedTo?.code || !dateStr) return;
    try {
      const fromCode = direction === "departure" ? selectedFrom.code : selectedTo.code;
      const toCode = direction === "departure" ? selectedTo.code : selectedFrom.code;

      const res = await axios.post(`${API_BASE_URL}/flights/update-calendar-fare`, {
        From_IATACODE: fromCode,
        To_IATACODE: toCode,
        departure_date: dateStr,
        flights_category: cabinClass
      });

      if (res.data?.responseData?.Response?.SearchResults) {
        const faresMap = {};
        res.data.responseData.Response.SearchResults.forEach(item => {
          const datePart = item.DepartureDate.split("T")[0];
          faresMap[datePart] = {
            fare: Math.max(item.Fare || 0, item.BaseFare || 0),
            isLowest: item.IsLowestFareOfMonth
          };
        });
        if (direction === "departure") {
          setDepCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
        } else {
          setRetCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
        }
      }
    } catch (err) {
      console.error("Error updating single day calendar fare in hero:", err);
    }
  };

  // Clear cached fares when airports or cabin class changes
  useEffect(() => {
    setDepCalendarFares({});
    setRetCalendarFares({});
  }, [selectedFrom?.code, selectedTo?.code, cabinClass]);

  // Pre-load / refetch fares when active calendar opens or values change
  useEffect(() => {
    if (selectedFrom?.code && selectedTo?.code) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Fetch departure fares when departure calendar is open or on initial load
      if (isCalendarOpen === "departure" || !isCalendarOpen) {
        fetchCalendarFaresForMonth(today, "departure");
        fetchCalendarFaresForMonth(nextMonth, "departure");

        const dep = new Date(departureDate);
        if (dep.getMonth() !== today.getMonth() && dep.getMonth() !== nextMonth.getMonth()) {
          fetchCalendarFaresForMonth(dep, "departure");
        }

        if (departureDate) {
          fetchCalendarFareOfTheDay(departureDate, "departure");
        }
      }

      // Fetch return fares when return calendar is open or on initial load
      if (flightType === "roundtrip" && (isCalendarOpen === "return" || !isCalendarOpen)) {
        fetchCalendarFaresForMonth(today, "return");
        fetchCalendarFaresForMonth(nextMonth, "return");

        const ret = new Date(returnDate);
        if (ret.getMonth() !== today.getMonth() && ret.getMonth() !== nextMonth.getMonth()) {
          fetchCalendarFaresForMonth(ret, "return");
        }

        if (returnDate) {
          fetchCalendarFareOfTheDay(returnDate, "return");
        }
      }
    }
  }, [selectedFrom?.code, selectedTo?.code, cabinClass, departureDate, returnDate, flightType, isCalendarOpen]);

  // Handle click outside traveler selector & dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (travelerRef.current && !travelerRef.current.contains(event.target)) {
        setIsTravelerOpen(false);
        setIsCabinDropdownOpen(false);
      }
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setIsFromOpen(false);
        setFromSearch(`${selectedFrom.city} / (${selectedFrom.code})`);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setIsToOpen(false);
        setToSearch(`${selectedTo.city} / (${selectedTo.code})`);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedFrom, selectedTo]);

  // Debouncing location searches - trigger on >= 1 characters
  useEffect(() => {
    if (!fromSearch || fromSearch.length < 1 || fromSearch === `${selectedFrom.city} / (${selectedFrom.code})`) {
      setFromAirports([]);
      setIsSearchingFrom(false);
      return;
    }
    setIsSearchingFrom(true);
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/flights/locations`, {
          params: { term: fromSearch }
        });
        if (res.data && res.data.airports) {
          setFromAirports(res.data.airports);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingFrom(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [fromSearch, selectedFrom]);

  useEffect(() => {
    if (!toSearch || toSearch.length < 1 || toSearch === `${selectedTo.city} / (${selectedTo.code})`) {
      setToAirports([]);
      setIsSearchingTo(false);
      return;
    }
    setIsSearchingTo(true);
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/flights/locations`, {
          params: { term: toSearch }
        });
        if (res.data && res.data.airports) {
          setToAirports(res.data.airports);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingTo(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [toSearch, selectedTo]);

  // 1. Listen for custom events dispatched by the Navbar
  useEffect(() => {
    const handleSetTab = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("setHeroTab", handleSetTab);
    return () => {
      window.removeEventListener("setHeroTab", handleSetTab);
    };
  }, []);

  // 2. Listen for navigation state from other pages redirecting to home
  useEffect(() => {
    if (location.state?.heroTab) {
      setActiveTab(location.state.heroTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.state]);

  // Dynamic backgrounds mapping
  const backgrounds = {
    flights: "/assets/home/hero/images/flight-bg.webp",
    hotels: "/assets/home/hero/images/hotel-bg.webp",
    holidays: "/assets/home/hero/images/holiday-bg.webp"
  };

  const handleDecrement = (label, currentVal, setVal) => {
    if (label === "Adults") {
      const newVal = Math.max(1, currentVal - 1);
      setVal(newVal);
      if (infants > newVal) {
        setInfants(newVal);
      }
    } else {
      setVal(Math.max(0, currentVal - 1));
    }
  };

  const handleIncrement = (label, currentVal, setVal) => {
    if (label === "Infants") {
      if (infants < adults) {
        setVal(currentVal + 1);
      }
    } else {
      setVal(currentVal + 1);
    }
  };

  const handleSearch = () => {
    if (activeTab === "flights") {
      if (selectedFrom?.code === selectedTo?.code) {
        return; // Block search for same route
      }
      try {
        sessionStorage.setItem(`airport_${selectedFrom.code.toUpperCase()}`, JSON.stringify(selectedFrom));
        sessionStorage.setItem(`airport_${selectedTo.code.toUpperCase()}`, JSON.stringify(selectedTo));
      } catch (err) {
        console.error("sessionStorage save error:", err);
      }
      navigate(`/flights?from=${selectedFrom.code}&to=${selectedTo.code}&depDate=${departureDate}&retDate=${returnDate}&isoneway=${flightType === "oneway" ? "Yes" : "No"}&adults=${adults}&children=${children}&infants=${infants}&class=${cabinClass}`);
    } else if (activeTab === "hotels") {
      navigate("/hotels");
    } else {
      navigate("/packages");
    }
  };

  const handleSwap = () => {
    setSwapToggled(prev => !prev);
    const temp = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(temp);
    setFromSearch(`${selectedTo.city} / (${selectedTo.code})`);
    setToSearch(`${temp.city} / (${temp.code})`);
  };

  const getWeekday = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const generateMonthDays = (year, month) => {
    const startDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const renderCalendarMonth = (year, month, selectedDateStr, onSelect) => {
    const days = generateMonthDays(year, month);
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div className="space-y-3 flex-1 w-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((w, idx) => (
            <span key={idx} className="text-[12px] font-bold text-gray-500 uppercase">{w}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="h-12 w-full"></div>;
            }

            const dayNum = dateObj.getDate();
            const pad = (n) => String(n).padStart(2, '0');
            const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dayNum)}`;

            const isSelected = dateStr === selectedDateStr;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isDisabled = dateObj < today || (isCalendarOpen === "return" && new Date(dateStr) < new Date(departureDate));

            const priceObj = isCalendarOpen === "departure" ? depCalendarFares[dateStr] : retCalendarFares[dateStr];
            const priceVal = priceObj?.fare;
            const isLowest = priceObj?.isLowest;
            const priceStr = priceVal ? `₹${Math.round(priceVal).toLocaleString()}` : "";

            return (
              <button
                key={dateStr}
                disabled={isDisabled}
                onClick={() => onSelect(dateStr)}
                className={`h-[48px] w-full rounded-lg flex flex-col items-center justify-center transition-all focus:outline-none relative ${isSelected
                  ? "bg-[#FF2D1A] text-white shadow-xs"
                  : isDisabled
                    ? "text-gray-300 cursor-not-allowed bg-transparent"
                    : "hover:bg-red-50/40 text-gray-850 cursor-pointer"
                  }`}
              >
                <span className={`text-[14px] font-bold ${isSelected ? "text-white" : isDisabled ? "text-gray-300" : "text-gray-800"}`}>
                  {dayNum}
                </span>
                {priceVal && !isDisabled && (
                  <span className={`text-[9px] block mt-0.5 leading-none ${isSelected
                    ? "text-white/95 font-medium"
                    : isLowest
                      ? "text-green-600 font-medium"
                      : "text-gray-500 font-medium"
                    }`}>
                    {priceStr}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const mergedFrom = fromSearch ? getMergedAirports(filterAirports(fromSearch), fromAirports) : popularAirports;
  const mergedTo = toSearch ? getMergedAirports(filterAirports(toSearch), toAirports) : popularAirports;

  return (
    <section className="relative h-auto min-h-[640px] lg:h-[700px] flex items-center font-sans bg-gray-100">

      {/* 1. Full-Width Background Image */}
      <div className="absolute inset-0 z-0 transition-all duration-700">
        <img
          src={backgrounds[activeTab]}
          alt={`${activeTab} background`}
          className="w-full h-full object-cover object-right transition-all duration-700"
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-white/20"></div>
      </div>

      {/* 2. Main content overlays */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 w-full relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column Text details */}
        <div className="lg:col-span-6 space-y-5 text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-satoshi text-black leading-tight tracking-tight">
            Your Journey Begins <span className="text-[#FF2D1A]">Here</span>
          </h1>
          <p className="text-gray-900 font-medium font-quicksand text-xs md:text-[15px] tracking-wide">
            Flights &middot; Hotels &middot; Trains &middot; Tour Packages &middot; Holiday Deals &mdash; all in one place
          </p>

          {/* Core Search Console Widget Card */}
          <div className="bg-white/95 backdrop-blur-xs text-gray-900 rounded-2xl shadow-2xl p-6 max-w-xl border border-gray-200/50">

            {/* Search tabs selection header */}
            <div className="flex space-x-8 border-b border-gray-200 pb-1.5 mb-5 font-poppins relative">
              {[
                { id: "flights", label: "Flights", iconPath: "/assets/home/hero/icons/flight.svg", sizeClass: "h-[20px] w-auto" },
                { id: "hotels", label: "Hotels", iconPath: "/assets/home/hero/icons/hotel.svg", sizeClass: "h-[20px] w-auto" },
                { id: "holidays", label: "Holidays", iconPath: "/assets/home/hero/icons/holiday.svg", sizeClass: "h-[24px] w-auto" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex flex-col items-center space-y-2 relative font-medium text-[14px] transition-colors ${activeTab === tab.id
                    ? "text-[#FF2D1A]"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <div className="h-6 flex items-center justify-center">
                    <img
                      src={tab.iconPath}
                      alt={tab.label}
                      className={`${tab.sizeClass} object-contain transition-all duration-300 ${activeTab === tab.id
                        ? "active-red-icon opacity-100"
                        : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                        }`}
                    />
                  </div>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-[-7.5px] left-0 w-full h-[4.41px] bg-[#FF2D1A] rounded-full z-10"></span>
                  )}
                </button>
              ))}
            </div>

            {/* ========================================================================= */}
            {/* FLIGHTS SEARCH CARD PANEL                                                 */}
            {/* ========================================================================= */}
            {activeTab === "flights" && (
              <div className="space-y-4 font-poppins">
                {/* Oneway/Roundtrip Options */}
                <div className="flex space-x-6 text-[12px] font-normal text-black animate-fade-in">
                  {[
                    { id: "oneway", label: "One Way" },
                    { id: "roundtrip", label: "Round Trip" }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="flightType"
                        checked={flightType === type.id}
                        onChange={() => setFlightType(type.id)}
                        className="accent-[#FF2D1A] w-3.5 h-3.5"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>

                {/* From & To Fields */}
                <div className="grid grid-cols-2 gap-3.5 relative">
                  {/* From Field */}
                  <div
                    ref={fromRef}
                    onClick={() => fromInputRef.current?.focus()}
                    className={`border rounded-xl p-3 bg-white text-left shadow-xs relative transition-colors cursor-text ${isFromOpen ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
                  >
                    <label className="block text-[10px] font-normal text-[#666666] select-none cursor-text">From</label>
                    <input
                      ref={fromInputRef}
                      type="text"
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setIsFromOpen(true);
                      }}
                      onFocus={() => {
                        setIsFromOpen(true);
                        setFromSearch("");
                      }}
                      onClick={() => setIsFromOpen(true)}
                      className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5 animate-pulse-slow cursor-text"
                    />
                    {!isFromOpen && (
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal truncate select-none cursor-text">
                        {selectedFrom.name}
                      </span>
                    )}

                    {isFromOpen && (
                      <div className="absolute left-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl z-50 border border-[#EAEAEA] overflow-hidden animate-fade-in w-[320px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <div className="max-h-60 overflow-y-auto">
                          {mergedFrom.length === 0 && !isSearchingFrom ? (
                            <div className="px-4 py-3 text-xs text-gray-400 font-medium select-none">No airports found</div>
                          ) : (
                            <>
                              {mergedFrom.map((airport) => (
                                <div
                                  key={airport.code}
                                  onMouseDown={() => {
                                    setSelectedFrom({
                                      code: airport.code,
                                      name: airport.name,
                                      city: airport.CityName || airport.city_fullname?.split(",")[0] || "",
                                      country: airport.CountryName
                                    });
                                    setFromSearch(`${airport.CityName || airport.city_fullname?.split(",")[0] || ""} / (${airport.code})`);
                                    setIsFromOpen(false);
                                  }}
                                  className="px-4 py-2.5 hover:bg-red-50/50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                                >
                                  <div className="text-left flex-1 min-w-0 pr-4">
                                    <span className="font-extrabold text-sm text-gray-800 block truncate select-none">
                                      {airport.CityName || airport.city_fullname?.split(",")[0] || ""}
                                      {airport.CountryName ? `, ${airport.CountryName}` : ""}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block truncate select-none">{airport.name}</span>
                                  </div>
                                  <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-md text-[11px] font-mono select-none">{airport.code}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Swap Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap();
                    }}
                    className="absolute left-[calc(50%-17px)] top-[calc(50%-17px)] w-[34px] h-[34px] z-10 active:scale-95 transition-transform duration-500 cursor-pointer"
                  >
                    <img
                      src="/assets/home/hero/icons/from-to.svg"
                      alt="Swap"
                      className={`w-full h-full transition-transform duration-500 ${swapToggled ? "rotate-180" : "rotate-0"}`}
                    />
                  </button>

                  {/* To Field */}
                  <div
                    ref={toRef}
                    onClick={() => toInputRef.current?.focus()}
                    className={`border rounded-xl p-3 bg-white text-left shadow-xs relative transition-colors cursor-text ${isToOpen ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
                  >
                    <label className="block text-[10px] font-normal text-[#666666] select-none cursor-text">To</label>
                    <input
                      ref={toInputRef}
                      type="text"
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setIsToOpen(true);
                      }}
                      onFocus={() => {
                        setIsToOpen(true);
                        setToSearch("");
                      }}
                      onClick={() => setIsToOpen(true)}
                      className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5 cursor-text"
                    />
                    {!isToOpen && (
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal truncate select-none cursor-text">
                        {selectedTo.name}
                      </span>
                    )}

                    {isToOpen && (
                      <div className="absolute right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl z-50 border border-[#EAEAEA] overflow-hidden animate-fade-in w-[320px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <div className="max-h-60 overflow-y-auto">
                          {mergedTo.length === 0 && !isSearchingTo ? (
                            <div className="px-4 py-3 text-xs text-gray-400 font-medium select-none">No airports found</div>
                          ) : (
                            <>
                              {mergedTo.map((airport) => (
                                <div
                                  key={airport.code}
                                  onMouseDown={() => {
                                    setSelectedTo({
                                      code: airport.code,
                                      name: airport.name,
                                      city: airport.CityName || airport.city_fullname?.split(",")[0] || "",
                                      country: airport.CountryName
                                    });
                                    setToSearch(`${airport.CityName || airport.city_fullname?.split(",")[0] || ""} / (${airport.code})`);
                                    setIsToOpen(false);
                                  }}
                                  className="px-4 py-2.5 hover:bg-red-50/50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                                >
                                  <div className="text-left flex-1 min-w-0 pr-4">
                                    <span className="font-extrabold text-sm text-gray-800 block truncate select-none">
                                      {airport.CityName || airport.city_fullname?.split(",")[0] || ""}
                                      {airport.CountryName ? `, ${airport.CountryName}` : ""}
                                    </span>
                                    <span className="text-[10px] text-gray-400 block truncate select-none">{airport.name}</span>
                                  </div>
                                  <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-md text-[11px] font-mono select-none">{airport.code}</span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Same Airport Warning (MMT Style Absolute Tooltip) */}
                    {selectedFrom?.code === selectedTo?.code && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] bg-[#FFEBEB] text-[#FF2D1A] border border-[#FFD2D2] rounded-md px-3.5 py-2 text-[11px] font-bold shadow-md z-45 w-[250px] flex items-center justify-center space-x-1.5 animate-fade-in pointer-events-none before:content-[''] before:absolute before:top-[-6px] before:left-1/2 before:-translate-x-1/2 before:border-l-[6px] before:border-l-transparent before:border-r-[6px] before:border-r-transparent before:border-b-[6px] before:border-b-[#FFEBEB] after:content-[''] after:absolute after:top-[-7px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-l-transparent after:border-r-[6px] after:border-r-transparent after:border-b-[7px] after:border-b-[#FFD2D2] after:-z-10">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#FF2D1A]" />
                        <span>From & To airports cannot be the same</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates selection */}
                <div className="relative" ref={calendarRef}>
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Departure Box */}
                    <div
                      onClick={() => {
                        setIsCalendarOpen(prev => prev === "departure" ? null : "departure");
                        setIsFromOpen(false);
                        setIsToOpen(false);
                        setIsTravelerOpen(false);
                        setCurrentCalDate(new Date(departureDate));
                      }}
                      className={`border rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center relative cursor-pointer transition-colors ${isCalendarOpen === "departure" ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
                    >
                      <div className="cursor-pointer flex-1 min-w-0 pr-2">
                        <label className="block text-[10px] font-normal text-[#666666] cursor-pointer">Departure</label>
                        <span className="text-[16px] font-bold font-satoshi text-[#1A1A1A] block mt-0.5">
                          {new Date(departureDate).getDate()} {new Date(departureDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                        <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">
                          {getWeekday(departureDate)}
                        </span>
                      </div>
                      <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                    </div>

                    {/* Return Box */}
                    <div
                      onClick={() => {
                        if (flightType === "roundtrip") {
                          setIsCalendarOpen(prev => prev === "return" ? null : "return");
                          setIsFromOpen(false);
                          setIsToOpen(false);
                          setIsTravelerOpen(false);
                          setCurrentCalDate(new Date(returnDate));
                        }
                      }}
                      className={`border rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center transition-all relative ${flightType === "oneway" ? "opacity-50 cursor-not-allowed hover:border-gray-200" : "cursor-pointer hover:border-red-300"} ${isCalendarOpen === "return" ? "border-red-300" : "border-gray-200"}`}
                    >
                      <div className={`${flightType === "oneway" ? "cursor-not-allowed" : "cursor-pointer"} flex-1 min-w-0 pr-2`}>
                        <label className={`block text-[10px] font-normal text-[#666666] ${flightType === "oneway" ? "cursor-not-allowed" : "cursor-pointer"}`}>Return</label>
                        {flightType === "oneway" ? (
                          <>
                            <span className="text-[16px] font-bold font-satoshi text-gray-400 block mt-0.5">Select Date</span>
                            <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">N/A</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[16px] font-bold font-satoshi text-[#1A1A1A] block mt-0.5">
                              {new Date(returnDate).getDate()} {new Date(returnDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                            <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">
                              {getWeekday(returnDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <Calendar className={`w-4 h-4 text-gray-450 shrink-0 ml-2 ${flightType === "oneway" ? "cursor-not-allowed" : ""}`} />
                    </div>
                  </div>                  {/* Custom Large Fare Calendar Overlay (Single Month) */}
                  {isCalendarOpen && (
                    <div className={`absolute top-full bg-white rounded-2xl shadow-2xl z-50 p-4 font-poppins w-[390px] select-none border border-[#EAEAEA] ${isCalendarOpen === "return" ? "right-0" : "left-0"}`}>

                      {/* Calendar Header Nav */}
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                        <button
                          onClick={() => {
                            setCurrentCalDate(prev => {
                              const prevM = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
                              fetchCalendarFaresForMonth(prevM);
                              return prevM;
                            });
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-850 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-[12px] font-black text-gray-800 uppercase tracking-wide">
                          {currentCalDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentCalDate(prev => {
                              const nextM = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
                              fetchCalendarFaresForMonth(nextM);
                              return nextM;
                            });
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-850 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>

                      {/* Single Month Days Grid */}
                      <div className="flex items-start justify-between">
                        {renderCalendarMonth(
                          currentCalDate.getFullYear(),
                          currentCalDate.getMonth(),
                          isCalendarOpen === "departure" ? departureDate : returnDate,
                          (selectedStr) => {
                            if (isCalendarOpen === "departure") {
                              setDepartureDate(selectedStr);
                              // Ensure return date is not before departure date
                              if (new Date(returnDate) < new Date(selectedStr)) {
                                const nextDay = new Date(selectedStr);
                                nextDay.setDate(nextDay.getDate() + 7);
                                setReturnDate(nextDay.toISOString().split("T")[0]);
                              }
                              fetchCalendarFareOfTheDay(selectedStr, "departure");
                            } else {
                              setReturnDate(selectedStr);
                              fetchCalendarFareOfTheDay(selectedStr, "return");
                            }
                            setIsCalendarOpen(null);
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Travelers Details & CTA */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Travelers & Class Selector */}
                  <div
                    ref={travelerRef}
                    className={`border rounded-xl p-3 bg-white text-left shadow-xs relative cursor-pointer select-none flex justify-between items-center transition-colors ${isTravelerOpen ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
                    onClick={() => setIsTravelerOpen(!isTravelerOpen)}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Travellers & Class</label>
                      <span className="text-[16px] font-bold font-satoshi text-[#1A1A1A] block mt-0.5 truncate">
                        {adults + children + infants} Traveller{adults + children + infants > 1 ? "s" : ""}, {cabinClass}
                      </span>
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">
                        {adults} Ad, {children} Ch, {infants} Inf
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-2 transition-transform duration-200" style={{ transform: isTravelerOpen ? "rotate(180deg)" : "rotate(0deg)" }} />

                    {/* Popover content */}
                    {isTravelerOpen && (
                      <div
                        className="absolute left-0 right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl p-5 z-50 space-y-4 text-left animate-fade-in border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">Select Travellers</h4>

                        {/* Passenger count incrementors */}
                        <div className="space-y-3.5">
                          {[
                            { label: "Adults", desc: "Age 12+", val: adults, set: setAdults, min: 1 },
                            { label: "Children", desc: "Age 2-12", val: children, set: setChildren, min: 0 },
                            { label: "Infants", desc: "Age 0-2", val: infants, set: setInfants, min: 0 }
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-sm text-gray-800 block">{item.label}</span>
                                <span className="text-[10px] text-gray-400 block">{item.desc}</span>
                              </div>
                              <div className="flex items-center space-x-3.5">
                                <button
                                  onClick={() => handleDecrement(item.label, item.val, item.set)}
                                  className="w-7 h-7 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center bg-gray-50 active:scale-90 transition-all cursor-pointer"
                                >
                                  <Minus className="w-3 h-3 text-gray-650" />
                                </button>
                                <span className="font-extrabold text-sm text-gray-855 w-4 text-center">{item.val}</span>
                                <div
                                  title={item.label === "Infants" && infants >= adults ? "Number of infants cannot be more than adults" : undefined}
                                  className={item.label === "Infants" && infants >= adults ? "cursor-not-allowed" : ""}
                                >
                                  <button
                                    disabled={item.label === "Infants" && infants >= adults}
                                    onClick={() => handleIncrement(item.label, item.val, item.set)}
                                    className={`w-7 h-7 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center bg-gray-50 active:scale-90 transition-all cursor-pointer ${item.label === "Infants" && infants >= adults ? "opacity-40 pointer-events-none" : ""
                                      }`}
                                  >
                                    <Plus className="w-3 h-3 text-gray-650" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cabin class dropdown */}
                        <div className="space-y-1.5 pt-2.5 border-t border-gray-100 relative">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Cabin Class</label>
                          <button
                            type="button"
                            onClick={() => setIsCabinDropdownOpen(!isCabinDropdownOpen)}
                            className={`w-full border rounded-lg p-2 text-xs font-bold text-gray-750 bg-gray-50/50 flex items-center justify-between transition-colors focus:outline-none cursor-pointer text-left ${isCabinDropdownOpen ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
                          >
                            <span>{cabinClass === "First" ? "First Class" : cabinClass}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isCabinDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isCabinDropdownOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl border border-[#EAEAEA] z-55 overflow-hidden text-left animate-fade-in">
                              {[
                                { val: "Economy", label: "Economy" },
                                { val: "Premium Economy", label: "Premium Economy" },
                                { val: "Business", label: "Business" },
                                { val: "First", label: "First Class" }
                              ].map((item) => (
                                <div
                                  key={item.val}
                                  onClick={() => {
                                    setCabinClass(item.val);
                                    setIsCabinDropdownOpen(false);
                                  }}
                                  className={`px-4 py-2.5 text-xs font-extrabold cursor-pointer hover:bg-red-50/50 transition-colors border-b border-gray-100 last:border-0 ${cabinClass === item.val ? "text-[#FF2D1A] bg-red-50/30" : "text-gray-700"
                                    }`}
                                >
                                  {item.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setIsTravelerOpen(false)}
                          className="w-full py-2 bg-[#FF2D1A] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <span className={selectedFrom?.code === selectedTo?.code ? "cursor-not-allowed w-full h-full block" : "w-full h-full block"}>
                    <button
                      onClick={handleSearch}
                      disabled={selectedFrom?.code === selectedTo?.code}
                      className={`font-poppins font-semibold text-[15px] rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2.5 w-full h-full min-h-[72px] ${selectedFrom?.code === selectedTo?.code
                        ? "bg-gray-300 text-gray-500 pointer-events-none shadow-none"
                        : "bg-[#FF2D1A] hover:bg-red-700 text-white hover:shadow-red-500/10 active:scale-95 cursor-pointer"
                        }`}
                    >
                      <img src="/assets/home/hero/icons/search.svg" alt="Search" className="w-5 h-5 brightness-0 invert" />
                      <span>Search</span>
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* HOTELS SEARCH CARD PANEL                                                  */}
            {/* ========================================================================= */}
            {activeTab === "hotels" && (
              <div className="space-y-4 font-poppins animate-fade-in">
                {/* Domestic/International Radio Buttons */}
                <div className="flex space-x-6 text-[12px] font-normal text-black animate-fade-in">
                  {[
                    { id: "domestic", label: "Domestic" },
                    { id: "international", label: "International" }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="hotelType"
                        checked={hotelType === type.id}
                        onChange={() => setHotelType(type.id)}
                        className="accent-[#FF2D1A] w-3.5 h-3.5"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>

                {/* Destination */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs w-full">
                  <label className="block text-[10px] font-normal text-[#666666]">Destination</label>
                  <input type="text" defaultValue="Delhi" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                  <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">India</span>
                </div>

                {/* Check-in & Check-out dates */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Check-in</label>
                      <input type="text" defaultValue="10/04/2026" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">Wednesday</span>
                    </div>
                    <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Check-out</label>
                      <input type="text" defaultValue="17/04/2026" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">Wednesday</span>
                    </div>
                    <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>
                </div>

                {/* Guests & search CTA */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Guests & Rooms</label>
                      <span className="text-[16px] font-bold font-satoshi text-[#1A1A1A] block mt-0.5 truncate">2 Adults, 1 Room</span>
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">1 Room</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>

                  <button
                    onClick={() => navigate("/coming-soon?feature=Hotels")}
                    className="font-poppins font-semibold text-[15px] rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2.5 w-full cursor-pointer h-full min-h-[72px] bg-[#FF2D1A] hover:bg-red-700 text-white hover:shadow-red-500/10 active:scale-95"
                  >
                    <img src="/assets/home/hero/icons/search.svg" alt="Search" className="w-5 h-5 brightness-0 invert" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* HOLIDAYS SEARCH CARD PANEL                                                 */}
            {/* ========================================================================= */}
            {activeTab === "holidays" && (
              <div className="space-y-4 font-poppins animate-fade-in">
                {/* Domestic/International Radio Buttons */}
                <div className="flex space-x-6 text-[12px] font-normal text-black animate-fade-in">
                  {[
                    { id: "domestic", label: "Domestic" },
                    { id: "international", label: "International" }
                  ].map((type) => (
                    <label key={type.id} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="holidayType"
                        checked={holidayType === type.id}
                        onChange={() => setHolidayType(type.id)}
                        className="accent-[#FF2D1A] w-3.5 h-3.5"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>

                {/* Destination & Budget */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs">
                    <label className="block text-[10px] font-normal text-[#666666]">Destination</label>
                    <input type="text" defaultValue="Delhi" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                    <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">India</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs">
                    <label className="block text-[10px] font-normal text-[#666666]">Budget</label>
                    <input type="text" defaultValue="₹ 50,000" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                    <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">Per Person</span>
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Start Date</label>
                      <input type="text" defaultValue="10/04/2026" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">Wednesday</span>
                    </div>
                    <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">End Date</label>
                      <input type="text" defaultValue="17/04/2026" className="w-full text-[16px] font-bold font-satoshi text-[#1A1A1A] bg-transparent focus:outline-none mt-0.5" />
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">Wednesday</span>
                    </div>
                    <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>
                </div>

                {/* Travelers & Search CTA */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="border border-gray-200 rounded-xl p-3 bg-white text-left shadow-xs flex justify-between items-center cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex-1 min-w-0 pr-2">
                      <label className="block text-[10px] font-normal text-[#666666]">Travelers</label>
                      <span className="text-[16px] font-bold font-satoshi text-[#1A1A1A] block mt-0.5 truncate">2 Adults</span>
                      <span className="text-[8px] text-[#666666] block mt-0.5 font-normal">No Class</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
                  </div>

                  <button
                    onClick={() => navigate("/coming-soon?feature=Holidays")}
                    className="font-poppins font-semibold text-[15px] rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2.5 w-full cursor-pointer h-full min-h-[72px] bg-[#FF2D1A] hover:bg-red-700 text-white hover:shadow-red-500/10 active:scale-95"
                  >
                    <img src="/assets/home/hero/icons/search.svg" alt="Search" className="w-5 h-5 brightness-0 invert" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
