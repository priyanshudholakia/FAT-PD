/**
 * ============================================================================
 * PATH: client/src/utils/fareBreakdown.js
 * DESCRIPTION: Shared helpers for turning Adivaha's per-search-result
 * `FareBreakdown` array (one entry per PassengerType, holding the TOTAL
 * base/tax for however many passengers of that type are on the search) into
 * the numbers the UI actually needs to show: real per-adult price on result
 * cards, and a full Adult/Child/Infant price-summary breakdown on the
 * booking page.
 *
 * IMPORTANT: `FareBreakdown[i]` only carries BaseFare + Tax (+ a few fee
 * fields) for that passenger type — it does NOT include everything that
 * makes up the top-level `Fare.PublishedFare` (e.g. `OtherCharges`, which in
 * practice holds convenience/markup charges that aren't split by passenger
 * type at all). Summing FareBreakdown alone therefore UNDER-counts the real
 * price — for a single adult this showed up as the per-adult figure being
 * short by exactly `Fare.OtherCharges` (e.g. ₹4,649 shown vs the real
 * ₹4,796.5 PublishedFare, a ₹147.5 gap).
 *
 * To keep every number honest, we always reconcile against the authoritative
 * total — `Fare.PublishedFare` — by computing whatever FareBreakdown leaves
 * unaccounted for ("leftover": OtherCharges, PGCharge, ServiceFee, discounts,
 * etc.) and spreading it evenly across every traveller on the booking. That
 * guarantees:
 *   sum over all rows of (perUnitFare * count) === Fare.PublishedFare
 * exactly, for any passenger mix — 1 adult, or 2 adults + 1 child + 1 infant.
 *
 * PassengerType: 1 = Adult, 2 = Child, 3 = Infant.
 * ============================================================================
 */

export const PAX_TYPE_LABELS = { 1: "Adult", 2: "Child", 3: "Infant" };

const num = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Returns one row per PassengerType present in the option's FareBreakdown,
 * with the PER-UNIT amount (what a single adult/child/infant actually pays)
 * already reconciled so every row's total, summed across all rows, equals
 * `Fare.PublishedFare` exactly. Returns null if the option has no
 * FareBreakdown to derive real numbers from.
 */
export function getFareBreakdownByType(rawOption) {
  const breakdown = rawOption?.FareBreakdown;
  if (!Array.isArray(breakdown) || breakdown.length === 0) return null;

  const rawRows = breakdown
    .filter((b) => b && b.PassengerType)
    .map((b) => {
      const count = num(b.PassengerCount) || 1;
      const totalBase = num(b.BaseFare);
      const totalTax =
        num(b.Tax) +
        num(b.TransactionFee) +
        num(b.AdditionalTxnFeePub) +
        num(b.AdditionalTxnFeeOfrd) +
        num(b.PGCharge) +
        num(b.SupplierReissueCharges);

      return {
        type: b.PassengerType,
        label: PAX_TYPE_LABELS[b.PassengerType] || "Traveller",
        count,
        currency: b.Currency || "INR",
        totalBase,
        totalTax,
        raw: b
      };
    })
    .sort((a, b) => a.type - b.type); // stable Adult, Child, Infant order

  if (rawRows.length === 0) return null;

  const totalTravellers = rawRows.reduce((sum, r) => sum + r.count, 0) || 1;
  const sumFromBreakdown = rawRows.reduce((sum, r) => sum + r.totalBase + r.totalTax, 0);

  // Whatever Fare.PublishedFare has that FareBreakdown didn't account for
  // (OtherCharges, PGCharge, ServiceFee, CFAR/DCFAR, minus Discount, etc.),
  // spread evenly per traveller so the totals reconcile exactly.
  const publishedFare = num(rawOption?.Fare?.PublishedFare);
  const leftoverTotal = publishedFare ? publishedFare - sumFromBreakdown : 0;
  const leftoverPerTraveller = leftoverTotal / totalTravellers;

  return rawRows.map((r) => {
    const totalLeftover = leftoverPerTraveller * r.count;
    const totalFare = r.totalBase + r.totalTax + totalLeftover;
    return {
      ...r,
      totalLeftover,
      totalFare,
      perUnitBase: r.totalBase / r.count,
      perUnitTax: r.totalTax / r.count,
      perUnitLeftover: leftoverPerTraveller,
      perUnitFare: totalFare / r.count
    };
  });
}

/**
 * Real per-adult price for result-card / fare-card display, reconciled so it
 * always matches what a single adult actually pays toward
 * Fare.PublishedFare. Falls back to the provided total (old behaviour) only
 * when the option carries no FareBreakdown at all, so the UI never shows a
 * hard error.
 */
export function getPerAdultFare(rawOption, fallbackTotal = 0) {
  const rows = getFareBreakdownByType(rawOption);
  if (!rows) return fallbackTotal;
  const adultRow = rows.find((r) => r.type === 1) || rows[0];
  return adultRow ? adultRow.perUnitFare : fallbackTotal;
}

/** Total traveller count across all passenger types in the breakdown. */
export function getTotalTravellerCount(rawOption, fallback = 1) {
  const rows = getFareBreakdownByType(rawOption);
  if (!rows) return fallback;
  return rows.reduce((sum, r) => sum + r.count, 0) || fallback;
}

/**
 * Builds the exact per-PASSENGER (single unit, not the whole type's total)
 * Fare sub-object Adivaha's booking API expects inside each Passengers[]
 * entry. BaseFare/Tax come straight from that PassengerType's FareBreakdown
 * row divided by its count; the reconciled leftover share (OtherCharges,
 * PGCharge, etc.) is placed in OtherCharges so this passenger's own
 * BaseFare + Tax + OtherCharges still sums to their true per-unit fare.
 * Falls back to the aggregate Fare object (old behaviour) if no
 * FareBreakdown row exists for the requested paxType, so booking never
 * silently fails to send a Fare object at all.
 */
export function buildPerPassengerFare(rawOption, paxType) {
  const rows = getFareBreakdownByType(rawOption);
  const row = rows?.find((r) => r.type === paxType);
  const fareObj = rawOption?.Fare || {};

  if (!row) {
    // No breakdown available for this pax type — best-effort fallback to
    // the aggregate Fare object rather than sending nothing.
    return fareObj;
  }

  return {
    Currency: row.currency || fareObj.Currency || "INR",
    BaseFare: round2(row.perUnitBase),
    Tax: round2(row.perUnitTax),
    YQTax: round2(num(row.raw.YQTax) / row.count),
    AdditionalTxnFeeOfrd: round2(num(row.raw.AdditionalTxnFeeOfrd) / row.count),
    AdditionalTxnFeePub: round2(num(row.raw.AdditionalTxnFeePub) / row.count),
    PGCharge: round2(num(row.raw.PGCharge) / row.count),
    // Reconciled share of OtherCharges/ServiceFee/etc. that FareBreakdown
    // doesn't split by passenger type — see file header for why this exists.
    OtherCharges: round2(row.perUnitLeftover),
    ServiceFee: 0,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    PublishedFare: round2(row.perUnitFare),
    OfferedFare: round2(row.perUnitFare)
  };
}
