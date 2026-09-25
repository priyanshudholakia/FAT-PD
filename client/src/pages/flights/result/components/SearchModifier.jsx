/**
 * ============================================================================
 * PATH: client/src/pages/flights/result/components/SearchModifier.jsx
 * DESCRIPTION: Header flight search modification console, fully stateful and interactive.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RefreshCw, Calendar, ChevronDown, AlertTriangle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
  { code: "JAI", name: "Jaipur International Airport", CityName: "Jaipur", CountryName: "Jaipur" },
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

const popularAirports = [
  { code: "DEL", name: "Indira Gandhi International Airport", CityName: "Delhi", CountryName: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", CityName: "Mumbai", CountryName: "India" },
  { code: "BLR", name: "Kempegowda International Airport", CityName: "Bengaluru", CountryName: "India" },
  { code: "DXB", name: "Dubai International Airport", CityName: "Dubai", CountryName: "United Arab Emirates" },
  { code: "MAA", name: "Chennai International Airport", CityName: "Chennai", CountryName: "India" }
];

const getAirportDisplayName = (code) => {
  const match = allAirports.find(a => a.code.toUpperCase() === code.toUpperCase());
  if (match) return `${match.CityName} (${match.code})`;
  return code;
};

const filterAirports = (query) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  return allAirports.filter(airport => {
    return (
      airport.code.toLowerCase().includes(q) ||
      airport.CityName.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q)
    );
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

export default function SearchModifier({ fareType, setFareType, externalCalendarFares, setExternalCalendarFares }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const fromVal = searchParams.get("from") || "DEL";
  const toVal = searchParams.get("to") || "BOM";
  const depDateVal = searchParams.get("depDate") || "";
  const retDateVal = searchParams.get("retDate") || "";
  const isonewayVal = searchParams.get("isoneway") || "Yes";
  const adultsVal = Number(searchParams.get("adults") || "1");
  const childrenVal = Number(searchParams.get("children") || "0");
  const infantsVal = Number(searchParams.get("infants") || "0");
  const cabinClassVal = searchParams.get("class") || "Economy";

  // Form states
  const [flightType, setFlightType] = useState(isonewayVal === "Yes" ? "oneway" : "roundtrip");

  const getInitialAirport = (code) => {
    const match = allAirports.find(a => a.code.toUpperCase() === code.toUpperCase());
    if (match) return match;

    try {
      const stored = sessionStorage.getItem(`airport_${code.toUpperCase()}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.code) {
          return {
            code: parsed.code,
            name: parsed.name,
            CityName: parsed.CityName || parsed.city || parsed.code,
            CountryName: parsed.CountryName || parsed.country || ""
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { code, name: "International Airport", CityName: code, CountryName: "" };
  };

  const getInitialAirportDisplayName = (code) => {
    const match = getInitialAirport(code);
    if (match.CityName && match.CityName !== match.code) {
      return `${match.CityName} (${match.code})`;
    }
    return match.code;
  };

  const getDisplayVal = (selectedAirport) => {
    if (selectedAirport && selectedAirport.CityName && selectedAirport.CityName !== selectedAirport.code) {
      return `${selectedAirport.CityName} (${selectedAirport.code})`;
    }
    return selectedAirport?.code || "";
  };

  const [fromSearch, setFromSearch] = useState(() => getInitialAirportDisplayName(fromVal));
  const [selectedFrom, setSelectedFrom] = useState(() => getInitialAirport(fromVal));
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [fromAirports, setFromAirports] = useState([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);

  const [toSearch, setToSearch] = useState(() => getInitialAirportDisplayName(toVal));
  const [selectedTo, setSelectedTo] = useState(() => getInitialAirport(toVal));
  const [isToOpen, setIsToOpen] = useState(false);
  const [toAirports, setToAirports] = useState([]);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  const [departureDate, setDepartureDate] = useState(depDateVal);
  const [returnDate, setReturnDate] = useState(retDateVal || depDateVal);

  const [adults, setAdults] = useState(adultsVal);
  const [children, setChildren] = useState(childrenVal);
  const [infants, setInfants] = useState(infantsVal);
  const [cabinClass, setCabinClass] = useState(cabinClassVal);
  const [isTravelerOpen, setIsTravelerOpen] = useState(false);
  const [isCabinDropdownOpen, setIsCabinDropdownOpen] = useState(false);
  const [isTripTypeOpen, setIsTripTypeOpen] = useState(false);

  // Calendar states
  const [isCalendarOpen, setIsCalendarOpen] = useState(null); // "departure" | "return" | null
  const [depCalendarFares, setDepCalendarFares] = useState({});
  const [retCalendarFares, setRetCalendarFares] = useState({});
  const [currentCalDate, setCurrentCalDate] = useState(new Date());

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const travelerRef = useRef(null);
  const calendarRef = useRef(null);
  const tripTypeRef = useRef(null);

  // Sync states with URL changes
  useEffect(() => {
    setFromSearch(getInitialAirportDisplayName(fromVal));
    setSelectedFrom(getInitialAirport(fromVal));
    setToSearch(getInitialAirportDisplayName(toVal));
    setSelectedTo(getInitialAirport(toVal));
    setDepartureDate(depDateVal);
    setReturnDate(retDateVal || depDateVal);
    setFlightType(isonewayVal === "Yes" ? "oneway" : "roundtrip");
    setAdults(adultsVal);
    setChildren(childrenVal);
    setInfants(infantsVal);
    setCabinClass(cabinClassVal);
  }, [fromVal, toVal, depDateVal, retDateVal, isonewayVal, adultsVal, childrenVal, infantsVal, cabinClassVal]);

  // Fetch initial airport info from API on load if not hardcoded in allAirports
  useEffect(() => {
    const fetchInitialAirports = async () => {
      // For From
      const fromMatch = allAirports.find(a => a.code.toUpperCase() === fromVal.toUpperCase());
      if (!fromMatch) {
        try {
          const res = await axios.get(`${API_BASE_URL}/flights/locations`, { params: { term: fromVal } });
          if (res.data?.airports?.length > 0) {
            const airport = res.data.airports[0];
            setSelectedFrom({
              code: airport.code,
              name: airport.name,
              CityName: airport.CityName || airport.city_fullname?.split(",")[0] || "",
              CountryName: airport.CountryName
            });
            setFromSearch(`${airport.CityName || airport.city_fullname?.split(",")[0] || ""} (${airport.code})`);
          }
        } catch (err) {
          console.error("Error fetching initial from airport details:", err);
        }
      }

      // For To
      const toMatch = allAirports.find(a => a.code.toUpperCase() === toVal.toUpperCase());
      if (!toMatch) {
        try {
          const res = await axios.get(`${API_BASE_URL}/flights/locations`, { params: { term: toVal } });
          if (res.data?.airports?.length > 0) {
            const airport = res.data.airports[0];
            setSelectedTo({
              code: airport.code,
              name: airport.name,
              CityName: airport.CityName || airport.city_fullname?.split(",")[0] || "",
              CountryName: airport.CountryName
            });
            setToSearch(`${airport.CityName || airport.city_fullname?.split(",")[0] || ""} (${airport.code})`);
          }
        } catch (err) {
          console.error("Error fetching initial to airport details:", err);
        }
      }
    };
    fetchInitialAirports();
  }, [fromVal, toVal]);

  // Click outside handling
  useEffect(() => {
    function handleClickOutside(event) {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setIsFromOpen(false);
        setFromSearch(getDisplayVal(selectedFrom));
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setIsToOpen(false);
        setToSearch(getDisplayVal(selectedTo));
      }
      if (travelerRef.current && !travelerRef.current.contains(event.target)) {
        setIsTravelerOpen(false);
        setIsCabinDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(null);
      }
      if (tripTypeRef.current && !tripTypeRef.current.contains(event.target)) {
        setIsTripTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedFrom, selectedTo]);

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
        const parentFaresMap = {};
        results.forEach(item => {
          const datePart = item.DepartureDate.split("T")[0];
          const fareVal = Math.max(item.Fare || 0, item.BaseFare || 0);
          faresMap[datePart] = {
            fare: fareVal,
            isLowest: item.IsLowestFareOfMonth
          };
          parentFaresMap[datePart] = fareVal;
        });
        if (direction === "departure") {
          setDepCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
          const isRouteMatching = selectedFrom?.code === fromVal && selectedTo?.code === toVal;
          if (isRouteMatching && setExternalCalendarFares) {
            setExternalCalendarFares(prev => ({
              ...prev,
              ...parentFaresMap
            }));
          }
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
        const parentFaresMap = {};
        res.data.responseData.Response.SearchResults.forEach(item => {
          const datePart = item.DepartureDate.split("T")[0];
          const fareVal = Math.max(item.Fare || 0, item.BaseFare || 0);
          faresMap[datePart] = {
            fare: fareVal,
            isLowest: item.IsLowestFareOfMonth
          };
          parentFaresMap[datePart] = fareVal;
        });
        if (direction === "departure") {
          setDepCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
          const isRouteMatching = selectedFrom?.code === fromVal && selectedTo?.code === toVal;
          if (isRouteMatching && setExternalCalendarFares) {
            setExternalCalendarFares(prev => ({
              ...prev,
              ...parentFaresMap
            }));
          }
        } else {
          setRetCalendarFares(prev => ({
            ...prev,
            ...faresMap
          }));
        }
      }
    } catch (err) {
      console.error("Error updating single day calendar fare in modifier:", err);
    }
  };

  // Clear cached fares when airports or cabin class changes
  useEffect(() => {
    setDepCalendarFares({});
    setRetCalendarFares({});
    if (setExternalCalendarFares) {
      setExternalCalendarFares({});
    }
  }, [selectedFrom?.code, selectedTo?.code, cabinClass]);

  useEffect(() => {
    if (selectedFrom?.code && selectedTo?.code) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Fetch departure calendar fares (From -> To) when departure calendar is open or on initial load
      if (isCalendarOpen === "departure" || !isCalendarOpen) {
        fetchCalendarFaresForMonth(today, "departure");
        fetchCalendarFaresForMonth(nextMonth, "departure");

        const dep = new Date(departureDate);
        if (dep.getMonth() !== today.getMonth() && dep.getMonth() !== nextMonth.getMonth()) {
          fetchCalendarFaresForMonth(dep, "departure");
        }

        // Fetch real-time updated calendar fare of the day directly to keep search modifier calendar in sync
        if (departureDate) {
          fetchCalendarFareOfTheDay(departureDate, "departure");
        }
      }

      // Fetch return calendar fares (To -> From) when return calendar is open or on initial load
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
      <div className="space-y-2 flex-1 w-full text-center">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((w, idx) => (
            <span key={idx} className="text-[10px] font-bold text-gray-500 uppercase">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="h-10 w-full"></div>;
            }

            const dayNum = dateObj.getDate();
            const pad = (n) => String(n).padStart(2, '0');
            const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dayNum)}`;

            const isSelected = dateStr === selectedDateStr;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isDisabled = dateObj < today || (isCalendarOpen === "return" && new Date(dateStr) < new Date(departureDate));

            const priceObj = isCalendarOpen === "departure" ? depCalendarFares[dateStr] : retCalendarFares[dateStr];
            let priceVal = priceObj?.fare;

            // Override with up-to-date calendar fares from the parent component if available
            // ONLY if the selected route in the form matches the active URL route
            const isRouteMatching = selectedFrom?.code === fromVal && selectedTo?.code === toVal;
            if (isCalendarOpen === "departure" && isRouteMatching && externalCalendarFares && externalCalendarFares[dateStr]) {
              priceVal = externalCalendarFares[dateStr];
            }

            const isLowest = priceObj?.isLowest;
            const priceStr = priceVal ? `₹${Math.round(priceVal).toLocaleString()}` : "";

            return (
              <button
                key={dateStr}
                disabled={isDisabled}
                onClick={() => onSelect(dateStr)}
                className={`h-[40px] w-full rounded-lg flex flex-col items-center justify-center transition-all focus:outline-none relative ${isSelected
                  ? "bg-[#FF2D1A] text-white shadow-xs"
                  : isDisabled
                    ? "text-gray-300 cursor-not-allowed bg-transparent"
                    : "hover:bg-red-50/40 text-gray-800 cursor-pointer"
                  }`}
              >
                <span className={`text-[12px] font-bold ${isSelected ? "text-white" : isDisabled ? "text-gray-300" : "text-gray-800"}`}>
                  {dayNum}
                </span>
                {priceVal && !isDisabled && (
                  <span className={`text-[8px] block mt-0.5 leading-none ${isSelected
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

  // Locations searching autocomplete
  useEffect(() => {
    if (!fromSearch || fromSearch.length < 1 || fromSearch === getDisplayVal(selectedFrom)) {
      setFromAirports([]);
      return;
    }
    setIsSearchingFrom(true);
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/flights/locations`, { params: { term: fromSearch } });
        if (res.data?.airports) setFromAirports(res.data.airports);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingFrom(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [fromSearch, selectedFrom]);

  useEffect(() => {
    if (!toSearch || toSearch.length < 1 || toSearch === getDisplayVal(selectedTo)) {
      setToAirports([]);
      return;
    }
    setIsSearchingTo(true);
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/flights/locations`, { params: { term: toSearch } });
        if (res.data?.airports) setToAirports(res.data.airports);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingTo(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [toSearch, selectedTo]);

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

  const handleSwap = () => {
    const tempSearch = fromSearch;
    const tempSelected = selectedFrom;
    setFromSearch(toSearch);
    setSelectedFrom(selectedTo);
    setToSearch(tempSearch);
    setSelectedTo(tempSelected);
  };

  const handleSearch = () => {
    if (selectedFrom.code === selectedTo.code) return;
    const isOneway = flightType === "oneway" ? "Yes" : "No";
    navigate(`/flights?from=${selectedFrom.code}&to=${selectedTo.code}&depDate=${departureDate}&retDate=${returnDate}&isoneway=${isOneway}&adults=${adults}&children=${children}&infants=${infants}&class=${cabinClass}`);
  };

  const fares = [
    { id: "regular", label: "Regular" },
    { id: "student", label: "Student" },
    { id: "armed", label: "Armed Forces" },
    { id: "senior", label: "Senior Citizen" }
  ];

  const mergedFrom = fromSearch ? getMergedAirports(filterAirports(fromSearch), fromAirports) : popularAirports;
  const mergedTo = toSearch ? getMergedAirports(filterAirports(toSearch), toAirports) : popularAirports;

  return (
    <section className="bg-white py-3.5 border-b border-[#EAEAEA] font-inter text-left select-none sticky top-0 z-45">
      <div className="max-w-7xl mx-auto px-4">

        {/* Modifier input row matching Figma spacing */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full">
          {/* Trip Type Select Dropdown */}
          <div ref={tripTypeRef} className={`border rounded-md px-3 py-1 bg-white flex flex-col justify-center h-[56px] w-[125px] text-[11px] relative cursor-pointer select-none transition-colors ${isTripTypeOpen ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`}>
            <span className="text-gray-400 font-medium leading-none">Trip Type</span>
            <div onClick={() => {
              setIsTripTypeOpen(!isTripTypeOpen);
              setIsFromOpen(false);
              setIsToOpen(false);
              setIsTravelerOpen(false);
              setIsCalendarOpen(null);
            }} className="w-full text-gray-800 font-extrabold truncate mt-0.5 text-[13px] flex items-center justify-between">
              <span>{flightType === "oneway" ? "One Way" : "Round Trip"}</span>
              <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
            </div>

            {isTripTypeOpen && (
              <div className="absolute left-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl z-50 w-32 border border-[#EAEAEA] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div
                  onClick={() => {
                    setFlightType("oneway");
                    setIsTripTypeOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs font-extrabold cursor-pointer hover:bg-red-50/50 transition-colors border-b border-gray-100 last:border-0 ${flightType === "oneway" ? "text-[#FF2D1A] bg-red-50/30" : "text-gray-700"
                    }`}
                >
                  One Way
                </div>
                <div
                  onClick={() => {
                    setFlightType("roundtrip");
                    setIsTripTypeOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs font-extrabold cursor-pointer hover:bg-red-50/50 transition-colors border-b border-gray-100 last:border-0 ${flightType === "roundtrip" ? "text-[#FF2D1A] bg-red-50/30" : "text-gray-700"
                    }`}
                >
                  Round Trip
                </div>
              </div>
            )}
          </div>

          {/* Combined From/To Input Section with Overlapping Swap Icon */}
          <div className="relative flex items-center justify-between flex-grow lg:flex-grow-0 w-full lg:w-[370px]">
            {/* From Input */}
            <div
              ref={fromRef}
              onClick={() => fromInputRef.current?.focus()}
              className={`border rounded-md px-3 py-1 bg-white flex flex-col justify-center w-[calc(50%-8px)] lg:w-[175px] text-[11px] h-[56px] relative transition-colors cursor-text ${isFromOpen ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`}
            >
              <span className="text-gray-400 font-medium leading-none select-none cursor-text">From</span>
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
                className="w-full text-gray-800 font-extrabold bg-transparent focus:outline-none mt-0.5 text-[13px] truncate cursor-text"
              />
              {isFromOpen && (
                <div className="absolute left-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl z-50 border border-[#EAEAEA] overflow-hidden w-[320px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                  <div className="max-h-60 overflow-y-auto">
                    {mergedFrom.length === 0 && !isSearchingFrom ? (
                      <div className="px-3 py-2 text-[10px] text-gray-400">No airports found</div>
                    ) : (
                      mergedFrom.map((airport) => (
                        <div
                          key={airport.code}
                          onMouseDown={() => {
                            setSelectedFrom(airport);
                            setFromSearch(`${airport.CityName} (${airport.code})`);
                            setIsFromOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-red-50/50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-0"
                        >
                          <div className="text-left flex-1 min-w-0 pr-2">
                            <span className="font-extrabold text-xs text-gray-800 block truncate select-none">
                              {airport.CityName}
                              {airport.CountryName ? `, ${airport.CountryName}` : ""}
                            </span>
                            <span className="text-[9px] text-gray-400 block truncate select-none">{airport.name}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono select-none">{airport.code}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location Swapper Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSwap();
              }}
              className="absolute left-1/2 -translate-x-1/2 z-10 w-[28px] h-[28px] active:scale-95 transition-transform duration-300 cursor-pointer"
            >
              <img
                src="/assets/home/hero/icons/from-to.svg"
                alt="Swap"
                className="w-full h-full object-contain"
              />
            </button>

            {/* To Input */}
            <div
              ref={toRef}
              onClick={() => toInputRef.current?.focus()}
              className={`border rounded-md px-3 py-1 bg-white flex flex-col justify-center w-[calc(50%-8px)] lg:w-[175px] text-[11px] h-[56px] relative transition-colors cursor-text ${isToOpen ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`}
            >
              <span className="text-gray-400 font-medium leading-none select-none cursor-text">To</span>
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
                className="w-full text-gray-800 font-extrabold bg-transparent focus:outline-none mt-0.5 text-[13px] truncate"
              />
              {isToOpen && (
                <div className="absolute right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl z-50 border border-[#EAEAEA] overflow-hidden w-[320px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                  <div className="max-h-60 overflow-y-auto">
                    {mergedTo.length === 0 && !isSearchingTo ? (
                      <div className="px-3 py-2 text-[10px] text-gray-400">No airports found</div>
                    ) : (
                      mergedTo.map((airport) => (
                        <div
                          key={airport.code}
                          onMouseDown={() => {
                            setSelectedTo(airport);
                            setToSearch(`${airport.CityName} (${airport.code})`);
                            setIsToOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-red-50/50 cursor-pointer flex items-center justify-between border-b border-gray-100 last:border-0"
                        >
                          <div className="text-left flex-1 min-w-0 pr-2">
                            <span className="font-extrabold text-xs text-gray-800 block truncate select-none">
                              {airport.CityName}
                              {airport.CountryName ? `, ${airport.CountryName}` : ""}
                            </span>
                            <span className="text-[9px] text-gray-400 block truncate select-none">{airport.name}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded text-[10px] font-mono select-none">{airport.code}</span>
                        </div>
                      ))
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

          {/* Departure Date */}
          <div ref={calendarRef} className="relative flex flex-col justify-center flex-grow lg:flex-grow-0 lg:w-[150px]">
            <div
              onClick={() => {
                setIsCalendarOpen(prev => prev === "departure" ? null : "departure");
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsTravelerOpen(false);
                setIsTripTypeOpen(false);
                setCurrentCalDate(new Date(departureDate));
              }}
              className={`border rounded-md px-3 py-1 bg-white flex justify-between items-center h-[56px] cursor-pointer select-none transition-colors ${isCalendarOpen === "departure" ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`}
            >
              <div className="flex-grow text-left flex flex-col justify-center">
                <span className="text-gray-400 font-medium leading-none text-[11px]">Departure</span>
                <span className="text-gray-800 font-extrabold block mt-0.5 text-[13px]">
                  {new Date(departureDate).getDate()} {new Date(departureDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
              <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
            </div>

            {isCalendarOpen === "departure" && (
              <div className="absolute left-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl p-4 z-50 w-[350px] border border-[#EAEAEA]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <button
                    onClick={() => setCurrentCalDate(prev => {
                      const prevM = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
                      fetchCalendarFaresForMonth(prevM, "departure");
                      return prevM;
                    })}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[12px] font-bold text-gray-800 uppercase">
                    {currentCalDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentCalDate(prev => {
                      const nextM = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
                      fetchCalendarFaresForMonth(nextM, "departure");
                      return nextM;
                    })}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                {renderCalendarMonth(currentCalDate.getFullYear(), currentCalDate.getMonth(), departureDate, (selectedStr) => {
                  setDepartureDate(selectedStr);
                  if (new Date(returnDate) < new Date(selectedStr)) {
                    const nextDay = new Date(selectedStr);
                    nextDay.setDate(nextDay.getDate() + 7);
                    setReturnDate(nextDay.toISOString().split("T")[0]);
                  }
                  fetchCalendarFareOfTheDay(selectedStr, "departure");
                  setIsCalendarOpen(null);
                })}
              </div>
            )}
          </div>

          {/* Return Date */}
          <div className={`relative flex flex-col justify-center flex-grow lg:flex-grow-0 lg:w-[150px] ${flightType === "oneway" ? "opacity-50 cursor-not-allowed" : ""}`}>
            <div
              onClick={() => {
                if (flightType === "roundtrip") {
                  setIsCalendarOpen(prev => prev === "return" ? null : "return");
                  setIsFromOpen(false);
                  setIsToOpen(false);
                  setIsTravelerOpen(false);
                  setIsTripTypeOpen(false);
                  setCurrentCalDate(new Date(returnDate));
                }
              }}
              className={`border rounded-md px-3 py-1 bg-white flex justify-between items-center h-[56px] select-none transition-colors ${flightType === "oneway"
                  ? "border-[#EAEAEA] opacity-50 cursor-not-allowed"
                  : `cursor-pointer ${isCalendarOpen === "return" ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`
                }`}
            >
              <div className="flex-grow text-left flex flex-col justify-center">
                <span className="text-gray-400 font-medium leading-none text-[11px]">Return</span>
                {flightType === "oneway" ? (
                  <span className="text-gray-400 font-extrabold block mt-0.5 text-[13px]">Select Date</span>
                ) : (
                  <span className="text-gray-800 font-extrabold block mt-0.5 text-[13px] truncate">
                    {new Date(returnDate).getDate()} {new Date(returnDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
              <Calendar className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
            </div>

            {isCalendarOpen === "return" && flightType === "roundtrip" && (
              <div className="absolute right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl p-4 z-50 w-[350px] border border-[#EAEAEA]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <button
                    onClick={() => setCurrentCalDate(prev => {
                      const prevM = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
                      fetchCalendarFaresForMonth(prevM, "return");
                      return prevM;
                    })}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[12px] font-bold text-gray-800 uppercase">
                    {currentCalDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setCurrentCalDate(prev => {
                      const nextM = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
                      fetchCalendarFaresForMonth(nextM, "return");
                      return nextM;
                    })}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                {renderCalendarMonth(currentCalDate.getFullYear(), currentCalDate.getMonth(), returnDate, (selectedStr) => {
                  setReturnDate(selectedStr);
                  fetchCalendarFareOfTheDay(selectedStr, "return");
                  setIsCalendarOpen(null);
                })}
              </div>
            )}
          </div>

          {/* Travelers & Class Selector */}
          <div ref={travelerRef} className={`border rounded-md px-3 py-1 bg-white flex flex-col justify-center flex-grow lg:flex-grow-0 lg:w-[235px] text-[11px] h-[56px] relative cursor-pointer select-none transition-colors ${isTravelerOpen ? "border-red-300" : "border-[#EAEAEA] hover:border-red-300"}`}>
            <span className="text-gray-400 font-medium leading-none">Travellers & Class</span>
            <div onClick={() => {
              setIsTravelerOpen(!isTravelerOpen);
              setIsFromOpen(false);
              setIsToOpen(false);
              setIsCalendarOpen(null);
              setIsTripTypeOpen(false);
            }} className="w-full text-gray-800 font-extrabold truncate mt-0.5 text-[13px] flex items-center justify-between">
              <span>{adults + children + infants} Traveller{adults + children + infants > 1 ? "s" : ""}, {cabinClass}</span>
              <ChevronDown className="w-4 h-4 text-gray-450 shrink-0 ml-2" />
            </div>

            {isTravelerOpen && (
              <div className="absolute right-0 top-[calc(100%+1px)] bg-white rounded-xl shadow-2xl p-4 z-50 w-64 space-y-3.5 border border-[#EAEAEA]" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-extrabold text-[11px] text-gray-500 uppercase tracking-wider">Select Travellers</h4>

                <div className="space-y-3">
                  {[
                    { label: "Adults", desc: "Age 12+", val: adults, set: setAdults, min: 1 },
                    { label: "Children", desc: "Age 2-12", val: children, set: setChildren, min: 0 },
                    { label: "Infants", desc: "Age 0-2", val: infants, set: setInfants, min: 0 }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-gray-800 block">{item.label}</span>
                        <span className="text-[9px] text-gray-400 block">{item.desc}</span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <button onClick={() => handleDecrement(item.label, item.val, item.set)} className="w-6 h-6 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center bg-gray-50 cursor-pointer">
                          <span className="text-xs font-bold">-</span>
                        </button>
                        <span className="font-extrabold text-xs text-gray-800 w-3 text-center">{item.val}</span>
                        <div
                          title={item.label === "Infants" && infants >= adults ? "Number of infants cannot be more than adults" : undefined}
                          className={item.label === "Infants" && infants >= adults ? "cursor-not-allowed" : ""}
                        >
                          <button
                            disabled={item.label === "Infants" && infants >= adults}
                            onClick={() => handleIncrement(item.label, item.val, item.set)}
                            className={`w-6 h-6 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center bg-gray-50 cursor-pointer ${item.label === "Infants" && infants >= adults ? "opacity-40 pointer-events-none" : ""
                              }`}
                          >
                            <span className="text-xs font-bold">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-2 border-t border-gray-100 relative">
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider">Cabin Class</label>
                  <button
                    type="button"
                    onClick={() => setIsCabinDropdownOpen(!isCabinDropdownOpen)}
                    className={`w-full border rounded-lg p-1.5 text-xs font-bold text-gray-700 bg-gray-50 flex items-center justify-between transition-colors focus:outline-none cursor-pointer text-left ${isCabinDropdownOpen ? "border-red-300" : "border-gray-200 hover:border-red-300"}`}
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

                <button onClick={() => setIsTravelerOpen(false)} className="w-full py-1.5 bg-[#FF2D1A] hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-xs cursor-pointer">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <span className={selectedFrom?.code === selectedTo?.code ? "cursor-not-allowed" : ""}>
            <button
              onClick={handleSearch}
              disabled={selectedFrom?.code === selectedTo?.code}
              className={`font-extrabold text-[12px] px-6 rounded-md flex items-center justify-center space-x-1.5 transition-colors shadow-sm active:scale-95 group h-[56px] flex-shrink-0 ${selectedFrom?.code === selectedTo?.code
                  ? "bg-gray-300 text-gray-500 pointer-events-none shadow-none"
                  : "bg-[#FF2D1A] hover:bg-red-700 text-white cursor-pointer"
                }`}
            >
              <img src="/assets/home/hero/icons/search.svg" alt="Search" className="w-4 h-4 brightness-0 invert group-hover:scale-110 transition-transform duration-300" />
              <span>Search</span>
            </button>
          </span>
        </div>

        {/* Fare Types pill row */}
        <div className="flex items-center space-x-3.5 mt-3.5 text-[11px] font-bold text-gray-500">
          <span className="text-gray-400 font-medium">Fare Type:</span>
          {fares.map((fare) => {
            const isActive = fareType === fare.id;
            return (
              <button
                key={fare.id}
                onClick={() => setFareType(fare.id)}
                className={`flex items-center space-x-1.5 border rounded px-3 py-1 bg-white hover:bg-gray-50 transition-all text-xs font-semibold ${isActive ? "border-gray-300 text-[#272727] bg-gray-50/20" : "border-[#EAEAEA] text-gray-400"
                  }`}
              >
                {isActive ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FF2D1A] flex items-center justify-center text-white select-none">
                    <svg className="w-2 h-2 stroke-white stroke-[3] fill-none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0"></span>
                )}
                <span className="leading-none text-[11px] font-bold">{fare.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
