import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, User, Plane, Clock, ShieldCheck, Tag, Backpack, Briefcase, ChevronRight, ChevronLeft, Building, Loader2 } from "lucide-react";
import axios from "axios";
import { getPerAdultFare, getTotalTravellerCount } from "../../../../utils/fareBreakdown";

export default function FareModal({ flight, traceId, onClose, onContinue, adults, children, infants }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [quoteData, setQuoteData] = useState(null);

  // Selected fare class state: 'saver', 'value', 'flexi'
  const [selectedFare, setSelectedFare] = useState("saver");

  const scrollContainerRef = useRef(null);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [showLeftScroll, setShowLeftScroll] = useState(false);

  // Fetch live Fare Quote & Rules from API on mount
  useEffect(() => {
    const fetchQuoteAndRules = async () => {
      const resultIndex = flight.rawOption?.ResultIndex;
      if (!traceId || !resultIndex) return;

      try {
        setLoadingQuote(true);
        setQuoteError(null);

        const [quoteRes, rulesRes] = await Promise.allSettled([
          axios.post(`${API_BASE_URL}/flights/fare-quote`, { TraceId: traceId, ResultIndex: resultIndex }),
          axios.post(`${API_BASE_URL}/flights/fare-rules`, { TraceId: traceId, ResultIndex: resultIndex })
        ]);

        if (quoteRes.status === "fulfilled" && quoteRes.value.data?.responseData?.Response) {
          const resp = quoteRes.value.data.responseData.Response;
          setQuoteData({
            results: resp.Results,
            isPriceChanged: resp.IsPriceChanged,
            traceId: resp.TraceId || traceId,
            rules: rulesRes.status === "fulfilled" ? rulesRes.value.data?.responseData?.Response?.FareRules : null
          });
        }
      } catch (err) {
        console.error("Error fetching live fare quote:", err);
        setQuoteError("Could not fetch latest fare quote");
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuoteAndRules();
  }, [flight, traceId]);

  // Determine active fare object (API quote result or search fallback)
  const activeResults = quoteData?.results || flight.rawOption;
  const activeFareObj = activeResults?.Fare || flight.rawOption?.Fare;

  // Parse base price number from live quote or fallback
  const basePriceNum = Math.round(activeFareObj?.PublishedFare || (parseInt(flight.price.replace(/[^\d]/g, ""), 10) || 2599));

  const segments = activeResults?.Segments?.[0] || flight.rawOption?.Segments?.[0] || [];
  const firstLeg = segments[0] || {};
  const lastLeg = segments[segments.length - 1] || firstLeg;

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = days[date.getDay()];
    const day = date.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayOfWeek}, ${day} ${month} ${year}`;
  };

  // Parse MiniFareRules dynamically strictly from API response (Search API or live Fare Rules API)
  const parseFareRules = (opt, quoteData) => {
    let cancelList = [];
    let changeList = [];

    // 1. Check MiniFareRules array inside option (from Search API)
    let rawMiniRules = opt.MiniFareRules;
    if (Array.isArray(rawMiniRules) && rawMiniRules.length > 0) {
      const rulesFlat = rawMiniRules.flat(2);
      rulesFlat.forEach(r => {
        if (!r || typeof r !== "object") return;

        const type = (r.Type || "").toLowerCase();
        let rawDetails = r.Details ? r.Details.replace(/INR/g, "₹").trim() : "";

        // Ensure 'fee' is appended to price string if it ends with digits
        let formattedDetails = rawDetails;
        if (rawDetails && !rawDetails.toLowerCase().includes("fee")) {
          formattedDetails = `${rawDetails} fee`;
        }

        let timingStr = "";
        if (r.From !== undefined && r.From !== null && r.From !== "") {
          if (r.To && r.To !== "0") {
            timingStr = `${r.From}–${r.To} ${r.Unit ? r.Unit.toLowerCase() : 'days'} left: `;
          } else {
            timingStr = `> ${r.From} ${r.Unit ? r.Unit.toLowerCase() : 'days'} left: `;
          }
        }

        const formattedRule = formattedDetails ? `${timingStr}${formattedDetails}` : "";

        if (type.includes("cancel") && formattedRule && !cancelList.includes(formattedRule)) {
          cancelList.push(formattedRule);
        } else if ((type.includes("reissue") || type.includes("change")) && formattedRule && !changeList.includes(formattedRule)) {
          changeList.push(formattedRule);
        }
      });
    }

    // 2. Fallback to quoteData.rules (from /flights/fare-rules API) if option has no inline search rules
    if (cancelList.length === 0 && changeList.length === 0 && quoteData?.rules) {
      const fareRulesList = Array.isArray(quoteData.rules) ? quoteData.rules : [];
      fareRulesList.forEach(ruleObj => {
        const miniRulesObj = ruleObj?.MiniFareRules;
        const rulesArray = miniRulesObj?.Rules || (Array.isArray(miniRulesObj) ? miniRulesObj.flat() : []);
        rulesArray.forEach(r => {
          if (!r || typeof r !== "object") return;
          const fee = r.PaxPenalties?.[0]?.AirlineFee;
          if (fee === undefined || fee === null) return;

          let timeText = "";
          if (r.FromDuration === "P3D") timeText = "> 3 days left";
          else if (r.FromDuration === "PT3H") timeText = "> 3 hours left";
          else if (r.FromDuration) timeText = `${r.FromDuration} left`;

          const feeText = fee === 0 ? "Free" : `₹${fee.toLocaleString()} fee`;
          const ruleStr = timeText ? `${timeText}: ${feeText}` : feeText;

          if (r.Type === 0 && !cancelList.includes(ruleStr)) {
            cancelList.push(ruleStr);
          } else if (r.Type === 1 && !changeList.includes(ruleStr)) {
            changeList.push(ruleStr);
          }
        });
      });
    }

    // 3. Check PenaltyCharges object if present
    if (cancelList.length === 0 && opt.PenaltyCharges?.CancellationCharge) {
      cancelList.push(opt.PenaltyCharges.CancellationCharge.replace(/INR/g, "₹"));
    }
    if (changeList.length === 0 && opt.PenaltyCharges?.ReissueCharge) {
      changeList.push(opt.PenaltyCharges.ReissueCharge.replace(/INR/g, "₹"));
    }

    return { cancelList, changeList };
  };

  // Build dynamic fare list directly from real API fare options if available
  const rawFareList = (flight.allFareOptions && flight.allFareOptions.length > 0)
    ? flight.allFareOptions
    : [flight.rawOption];

  const dynamicFares = rawFareList.map((opt, idx) => {
    // Real fare-class name from the API only — SupplierFareClass (e.g.
    // "PublishNDC") or FareClassification.Type. Previously an untagged
    // option silently became a fabricated "Saver"/"Value"/"Flexi" label by
    // position, which implies a specific airline fare product that may not
    // actually exist for this flight. When the API genuinely doesn't name
    // the fare class, say so honestly instead of inventing a tier name.
    const rawClass = opt.SupplierFareClass || opt.FareClassification?.Type || null;
    const fareTitle = rawClass
      ? (rawClass.toLowerCase().startsWith("economy") ? rawClass : `Economy ${rawClass}`)
      : "Fare Option " + (idx + 1);
    const price = Math.round(opt.Fare?.PublishedFare || 0);
    // "per adult" on each fare-class card must be the REAL per-adult price
    // (Adivaha's FareBreakdown Adult row total / adult count), not the
    // combined total charged for every adult/child/infant on the search.
    const totalTravellers = getTotalTravellerCount(
      opt,
      Number(adults || 1) + Number(children || 0) + Number(infants || 0) || 1
    );
    const perAdultPrice = Math.round(getPerAdultFare(opt, price));
    const segs = opt.Segments?.[0] || [];
    const fLeg = segs[0] || {};
    // Same principle as the search-card mapping: don't fabricate a weight
    // when the airline/fare genuinely doesn't report one via the API.
    const cBaggage = fLeg.CabinBaggage || "Not specified by airline";
    const chkBaggage = fLeg.Baggage ? fLeg.Baggage : "Not Included";

    const perks = [];
    if (Array.isArray(opt.FareInclusions)) {
      opt.FareInclusions.forEach(inc => {
        if (typeof inc === "string" && inc.trim()) {
          const subItems = inc.split("&&");
          subItems.forEach(item => {
            const trimmed = item.trim();
            if (trimmed && !trimmed.toLowerCase().includes("excluded") && !trimmed.toLowerCase().includes("false")) {
              perks.push(trimmed);
            }
          });
        }
      });
    }

    const { cancelList, changeList } = parseFareRules(opt, quoteData);

    return {
      id: idx,
      rawOption: opt,
      title: fareTitle,
      // NonStopFirstRanking/SmartChoiceRanking are real signals Adivaha
      // returns on every option — used below (after this map) to derive an
      // honest "Cheapest"/"Recommended" badge instead of a fabricated
      // "POPULAR"/"BEST VALUE" label invented purely from array position.
      smartChoiceRanking: opt.SmartChoiceRanking,
      price,
      perAdultPrice,
      totalTravellers,
      cabin: cBaggage,
      checkIn: `Check-in: ${chkBaggage}`,
      cancelList,
      changeList,
      perks
    };
  });

  // Badges are derived AFTER the map so "Cheapest" reflects the actual
  // lowest price in this exact list (not just array position — the caller
  // already sorts fareOptionsGroup ascending, but deriving it here keeps
  // this component correct even if that ever changes) and "Recommended"
  // reflects Adivaha's own SmartChoiceRanking signal (lower = better),
  // rather than a fabricated marketing label.
  if (dynamicFares.length > 0) {
    const cheapestIdx = dynamicFares.reduce((best, f, i) => (f.price < dynamicFares[best].price ? i : best), 0);
    const rankedIdx = dynamicFares
      .map((f, i) => ({ i, rank: f.smartChoiceRanking }))
      .filter((r) => r.rank !== undefined && r.rank !== null)
      .sort((a, b) => a.rank - b.rank)[0]?.i;

    dynamicFares.forEach((f, i) => {
      f.badge = null;
      f.badgeType = "gray";
      if (i === cheapestIdx) {
        f.badge = "CHEAPEST";
        f.badgeType = "red";
      } else if (rankedIdx === i) {
        f.badge = "RECOMMENDED";
      }
    });
  }

  const [selectedFareIdx, setSelectedFareIdx] = useState(0);
  const currentFare = dynamicFares[selectedFareIdx] || dynamicFares[0];

  // Handle scroll detection
  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 5);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener("resize", checkScrollState);
    return () => window.removeEventListener("resize", checkScrollState);
  }, [dynamicFares]);

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      // Scroll by 3 card widths + gaps
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [continueError, setContinueError] = useState(null);

  const handleContinueClick = async () => {
    const selectedResultIndex = currentFare?.rawOption?.ResultIndex || flight.rawOption?.ResultIndex;
    setContinueError(null);

    if (!traceId || !selectedResultIndex) {
      onContinue(currentFare, quoteData);
      return;
    }

    try {
      setIsSubmitting(true);
      // Re-quote the exact selected fare tier to get its fresh ResultIndex & confirmed price
      const quoteRes = await axios.post(`${API_BASE_URL}/flights/fare-quote`, {
        TraceId: traceId,
        ResultIndex: selectedResultIndex
      });

      const respObj = quoteRes.data?.responseData?.Response;
      if (respObj?.Error?.ErrorCode && respObj.Error.ErrorCode !== 0) {
        throw new Error(respObj.Error.ErrorMessage || "This fare could not be confirmed");
      }
      if (respObj?.Results) {
        // Some fares (visible on the search result as IsCouponAppilcable:
        // true) are locked behind a real promo/coupon code — Adivaha's
        // FareQuote confirms this definitively via IsPromoCodeRequired.
        // We don't block these anymore: `IsPromoCodeRequired` rides along
        // inside respObj.Results (assigned to quoteData.results below, which
        // becomes flight.rawOption on the Payment page), where the user is
        // prompted for a real promo code before they can pay for this fare.
        const updatedQuoteData = {
          results: respObj.Results,
          isPriceChanged: respObj.IsPriceChanged,
          traceId: respObj.TraceId || traceId,
          rules: quoteData?.rules
        };
        onContinue(currentFare, updatedQuoteData);
        return;
      }
      throw new Error("This fare could not be confirmed, please try again");
    } catch (err) {
      console.error("Error re-quoting selected fare tier:", err.response?.data || err.message);
      // quoteData from the mount-time effect only matches the ResultIndex of
      // dynamicFares[0] (it's fetched once for flight.rawOption, not per
      // selected tier). Falling back to it for any OTHER selected tier would
      // silently send a mismatched ResultIndex to SSR/Book and reproduce the
      // exact "Invalid ResultIndex. It should be same with Farequote
      // ResultIndex" error — so that fallback is only safe when the
      // mount-time quote and the currently selected tier are the same one.
      if (selectedFareIdx === 0 && quoteData?.results) {
        onContinue(currentFare, quoteData);
      } else {
        setContinueError("Could not confirm this fare right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-inter p-4">
      {/* Modal Container card */}
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative animate-fade-in text-left border border-[#EAEAEA] flex flex-col max-h-[90vh]">
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION                                                        */}
        {/* ========================================================================= */}
        <div className="p-5 border-b border-[#EAEAEA] relative bg-white">

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#EAEAEA] bg-white hover:bg-gray-50 flex items-center justify-center text-[#272727] hover:text-black transition-colors absolute right-5 top-5 z-10 shadow-3xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Primary Route Detail */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pr-20 md:pr-28">
            {/* Airline Info */}
            <div className="flex items-center space-x-3.5 w-64 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg border border-gray-100 bg-white flex-shrink-0 overflow-hidden">
                <img src={flight.logo} alt={flight.airline} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-black text-[15px] text-[#272727] leading-tight">{flight.airline} &bull; {flight.code}</h3>
                <p className="text-[11px] text-[#7E7E7E] font-bold mt-1">{formatDate(firstLeg.Origin?.DepTime)}</p>
              </div>
            </div>

            {/* Departure */}
            <div className="text-left md:text-center flex flex-col">
              <span className="text-[22px] font-black text-[#272727] leading-none">{flight.depTime}</span>
              <span className="text-[13px] font-extrabold text-[#272727] uppercase mt-1">{flight.fromCode}</span>
              <span className="text-[11px] font-bold text-[#7E7E7E] mt-0.5">
                {firstLeg.Origin?.Airport?.Terminal ? `Terminal ${firstLeg.Origin.Airport.Terminal}` : ""}
              </span>
            </div>

            {/* Timeline */}
            <div className="text-center flex-grow max-w-[180px] hidden md:block mx-6">
              <span className="text-[11px] font-bold text-[#7E7E7E]">{flight.duration}</span>
              <div className="relative w-full flex items-center justify-between my-1">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="h-[1px] flex-grow bg-gray-200"></div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plane className="w-3 h-3 text-[#7E7E7E] rotate-45 bg-white px-0.5 box-content" />
                </div>
              </div>
              <span className="text-[11px] text-[#7E7E7E] font-bold">{flight.stops}</span>
            </div>

            {/* Arrival */}
            <div className="text-left md:text-center flex flex-col">
              <div className="relative inline-flex items-center justify-start md:justify-center">
                <span className="text-[22px] font-black text-[#272727] leading-none">{flight.arrTime}</span>
                {flight.dayDiff > 0 && (
                  <span className="absolute left-full ml-1 text-[9px] font-bold text-[#FF2D1A] select-none flex flex-col items-start leading-[1.1] top-0 whitespace-nowrap">
                    <span>+{flight.dayDiff}</span>
                    <span className="text-[7px] uppercase tracking-wider text-gray-500">Day</span>
                  </span>
                )}
              </div>
              <span className="text-[13px] font-extrabold text-[#272727] uppercase mt-1">{flight.toCode}</span>
              <span className="text-[11px] font-bold text-[#7E7E7E] mt-0.5">
                {lastLeg.Destination?.Airport?.Terminal ? `Terminal ${lastLeg.Destination.Airport.Terminal}` : ""}
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. FARE SELECTION GRID                                                   */}
        {/* ========================================================================= */}
        <div className="p-5 flex-grow overflow-y-auto bg-gray-50/20 relative">

          {/* Live Price Change Alert Banner */}
          {quoteData?.isPriceChanged && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[12px] font-bold flex items-center justify-between shadow-2xs animate-fade-in">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 text-[12px] flex-shrink-0 font-extrabold">⚡</span>
                <div>
                  <p className="font-extrabold text-[#272727] leading-tight">Live Fare Update</p>
                  <p className="text-amber-800 font-semibold text-[11.5px] mt-0.5">The airline has updated the live fare for this flight. The prices shown below reflect the latest live quote.</p>
                </div>
              </div>
            </div>
          )}

          <span className="text-[11px] uppercase font-black tracking-widest text-[#7E7E7E] block mb-3.5">
            SELECT A FARE CLASS
          </span>

          <div className="relative">
            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollState}
              className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 px-0.5"
            >
              {dynamicFares.map((item, idx) => {
                const isSelected = selectedFareIdx === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedFareIdx(idx)}
                    className={`border-2 rounded-xl p-4.5 cursor-pointer transition-all flex flex-col justify-between relative min-h-[290px] w-[calc((100%-32px)/3)] flex-shrink-0 select-none box-border ${isSelected
                        ? "bg-[#FFF9F8] border-[#FF2D1A] shadow-sm"
                        : "bg-white border-[#EAEAEA] hover:border-gray-300"
                      }`}
                  >

                    {/* Card Header details */}
                    <div>
                      {/* Top Row: Radio selector & Price side-by-side with 'per adult' */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAEAEA]">
                        <div className="flex items-center space-x-2.5">
                          {/* Concentric Circle Radio Selector */}
                          {isSelected ? (
                            <span className="w-[18px] h-[18px] rounded-full border-2 border-[#FF2D1A] flex items-center justify-center bg-white flex-shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D1A]"></span>
                            </span>
                          ) : (
                            <span className="w-[18px] h-[18px] rounded-full border border-gray-300 flex-shrink-0 bg-white"></span>
                          )}

                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-[20px] font-black text-[#272727]">₹{item.perAdultPrice.toLocaleString()}</span>
                            <span className="text-[11px] text-[#7E7E7E] font-bold">per adult</span>
                          </div>
                        </div>
                      </div>

                      {/* Total price across every traveller on this search,
                          shown only when there's more than one, so it's
                          clear the per-adult figure above isn't the amount
                          that will actually be charged. */}
                      {item.totalTravellers > 1 && (
                        <p className="text-[11px] text-[#9A9A9A] font-semibold -mt-2.5 mb-3">
                          Total for {item.totalTravellers} travellers: ₹{item.price.toLocaleString()}
                        </p>
                      )}

                      {/* Fare Class Name */}
                      <h4 className="font-black text-[13px] text-[#7E7E7E] uppercase tracking-wider mb-3.5">{item.title}</h4>

                      {/* Features checklist */}
                      <div className="space-y-2 text-[11px] font-bold">
                        <div className="flex items-center space-x-1.5 text-[#272727] font-extrabold mb-1.5">
                          <Backpack className="w-3.5 h-3.5 text-[#7E7E7E]" />
                          <span>Baggage</span>
                        </div>
                        <p className="pl-5 text-[#6B6B6B] font-semibold text-[12px]">Cabin: {item.cabin}</p>
                        <p className="pl-5 text-[#6B6B6B] font-semibold text-[12px]">{item.checkIn}</p>

                        {(item.cancelList?.length > 0 || item.changeList?.length > 0) && (
                          <div className="pt-2">
                            <div className="flex items-center space-x-1.5 text-[#272727] font-extrabold mb-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#7E7E7E]" />
                              <span>Flexibility</span>
                            </div>
                            {item.cancelList?.map((cRule, cIdx) => (
                              <p key={`c-${cIdx}`} className="pl-5 text-[#6B6B6B] font-semibold text-[11.5px]">
                                Cancel: {cRule}
                              </p>
                            ))}
                            {item.changeList?.map((chRule, chIdx) => (
                              <p key={`ch-${chIdx}`} className="pl-5 text-[#6B6B6B] font-semibold text-[11.5px]">
                                Change: {chRule}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Extra Perks with green checkmarks */}
                        {item.perks.length > 0 && (
                          <div className="pt-2">
                            <div className="flex items-center space-x-1.5 text-[#272727] font-extrabold mb-1.5">
                              <Tag className="w-3.5 h-3.5 text-[#7E7E7E]" />
                              <span>Included Perks</span>
                            </div>
                            {item.perks.map((perk, pIdx) => (
                              <div key={pIdx} className="flex items-center space-x-1.5 text-[#00A852] pl-5 pt-1">
                                <svg className="w-3 h-3 text-[#00A852] stroke-[3.5] fill-none" viewBox="0 0 24 24" stroke="currentColor">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="font-bold text-[11.5px]">{perk}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Left Scroll Button */}
            {showLeftScroll && (
              <button
                onClick={handleScrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-30 w-10 h-10 rounded-full bg-white border border-[#008cff]/40 text-[#008cff] shadow-xl flex items-center justify-center hover:bg-[#008cff] hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Scroll Arrow Button */}
            {showRightScroll && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-30 flex items-center justify-end group">
                <button
                  onClick={handleScrollRight}
                  className="flex items-center justify-center bg-white border border-[#008cff]/40 text-[#008cff] rounded-full shadow-xl h-10 px-2.5 hover:px-3.5 hover:bg-[#008cff] hover:text-white transition-all duration-300 ease-out cursor-pointer whitespace-nowrap"
                >
                  <span className="max-w-0 opacity-0 overflow-hidden text-[12px] font-bold transition-all duration-300 ease-out group-hover:max-w-[160px] group-hover:opacity-100 group-hover:mr-1.5">
                    More fares available
                  </span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. MODAL ACTION FOOTER                                                    */}
        {/* ========================================================================= */}
        <div className="p-5 bg-white flex items-center justify-between border-t border-[#EAEAEA]">
          <div className="text-left flex flex-col justify-center">
            <span className="text-[12px] text-[#7E7E7E] font-medium block">
              Selected: <strong className="text-[#272727] font-extrabold">{currentFare.title}</strong>
            </span>
            <span className="text-[24px] font-black text-[#272727] leading-none mt-1">₹{currentFare.price.toLocaleString()}</span>
            {currentFare.totalTravellers > 1 && (
              <span className="text-[11px] text-[#7E7E7E] font-semibold mt-0.5">
                Total for {currentFare.totalTravellers} travellers (₹{currentFare.perAdultPrice.toLocaleString()} per adult)
              </span>
            )}
            {continueError && (
              <span className="text-[11px] text-red-600 font-semibold mt-1">{continueError}</span>
            )}
          </div>

          <button
            onClick={handleContinueClick}
            disabled={isSubmitting}
            className="w-[160px] h-[40px] rounded-lg bg-[#FF2D1A] hover:bg-red-750 text-white font-black text-[13px] tracking-wide transition-all shadow-sm active:scale-[0.98] cursor-pointer flex items-center justify-center select-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>Continue &rarr;</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}