// IMPORTANT: import from the package root ("pdfmake"), not a deep path like
// "pdfmake/js/printer.js". That deep path pointed at pdfmake's *old* 0.1/0.2
// build output, but the installed version was 0.3.x, which ships a totally
// different rewritten API (an async PdfPrinter that requires an explicit
// urlResolver/virtualfs, on a file literally named "Printer.js" — capital P).
// On Windows the mismatched casing resolved anyway (Windows' filesystem is
// case-insensitive) which is how this shipped without a "file not found"
// error, but the class it loaded was the new 0.3.x one — so
// `new PdfPrinter(fonts)` left `this.urlResolver` undefined, and the very
// first `resolveUrls()` call inside `createPdfKitDocument()` crashed with
// "Cannot read properties of undefined (reading 'resolve')". Because
// `createPdfKitDocument()` is `async` in 0.3.x, that crash happened inside a
// promise nothing here was awaiting or catching, which is what actually
// killed the whole Node process (unhandled rejection) rather than just
// failing the one email.
// On Linux (e.g. Vercel, where this deploys) the deep import would have
// failed outright with MODULE_NOT_FOUND, since the real file is `Printer.js`
// (capital P) — this bug would have taken down PDF/email generation there
// too, not just on this Windows dev machine.
// Pinning package.json to pdfmake@0.2.x (see server/package.json) restores
// the classic, synchronous, no-urlResolver-needed API this file was written
// for: `new PdfPrinter(fonts)` then a synchronous
// `printer.createPdfKitDocument(docDefinition)` that returns a pdfkit
// stream directly.
import PdfPrinterPkg from "pdfmake";
const PdfPrinter = PdfPrinterPkg.default || PdfPrinterPkg;

// Define fonts
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
};

const money = (val, currency = "INR") => `${currency} ${Number(val || 0).toLocaleString("en-IN")}`;

/**
 * Builds a real booking voucher PDF from a Booking record (as saved by
 * saveBookingToDatabase in routes/flights.js) plus the raw passenger array
 * that was actually sent to Adivaha.
 *
 * bookingData shape:
 * {
 *   bookingId, pnr, isLCC, airlineName, airlineCode, flightNumber,
 *   origin, destination, departureTime, arrivalTime, cabinClass,
 *   basePrice, taxes, totalAmount, currency, passengers, addons
 * }
 */
export const generateBookingPDF = (bookingData) => {
  return new Promise((resolve, reject) => {
    try {
      const passengers = Array.isArray(bookingData.passengers) ? bookingData.passengers : [];
      const currency = bookingData.currency || "INR";

      const passengerRows = passengers.length > 0
        ? passengers.map((p) => [
            `${p.Title || p.title || ""} ${p.FirstName || p.firstName || ""} ${p.LastName || p.lastName || ""}`.trim() || "Traveler",
            p.PaxType === 2 || p.paxType === 2 ? "Child" : (p.PaxType === 3 || p.paxType === 3 ? "Infant" : "Adult"),
            p.Email || p.email || "-",
            p.ContactNo || p.contactNo || "-",
          ])
        : [["Traveler", "Adult", "-", "-"]];

      const docDefinition = {
        pageMargins: [40, 40, 40, 40],
        content: [
          { text: "FlyAnyTrip", style: "brand" },
          { text: "E-Ticket / Booking Voucher", style: "subheader", margin: [0, 0, 0, 15] },

          {
            columns: [
              [
                { text: "PNR", style: "label" },
                { text: bookingData.pnr || "-", style: "value" },
              ],
              [
                { text: "Booking ID", style: "label" },
                { text: String(bookingData.bookingId || "-"), style: "value" },
              ],
              [
                { text: "Status", style: "label" },
                { text: "CONFIRMED", style: "value", color: "#0F9D58" },
              ],
            ],
            margin: [0, 0, 0, 20],
          },

          { text: "Flight Details", style: "sectionHeader" },
          {
            table: {
              widths: ["*", "*"],
              body: [
                ["Airline", `${bookingData.airlineName || "-"} ${bookingData.flightNumber ? `(${bookingData.airlineCode || ""}-${bookingData.flightNumber})` : ""}`],
                ["Route", `${bookingData.origin || "-"} -> ${bookingData.destination || "-"}`],
                ["Departure", formatDateTime(bookingData.departureTime)],
                ["Arrival", formatDateTime(bookingData.arrivalTime)],
                ["Cabin Class", bookingData.cabinClass || "Economy"],
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 5, 0, 20],
          },

          { text: "Passenger Details", style: "sectionHeader" },
          {
            table: {
              widths: ["*", "auto", "*", "auto"],
              headerRows: 1,
              body: [
                [
                  { text: "Name", style: "tableHeader" },
                  { text: "Type", style: "tableHeader" },
                  { text: "Email", style: "tableHeader" },
                  { text: "Contact", style: "tableHeader" },
                ],
                ...passengerRows,
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 5, 0, 20],
          },

          { text: "Fare Summary", style: "sectionHeader" },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                ["Base Fare", money(bookingData.basePrice, currency)],
                ["Taxes & Fees", money(bookingData.taxes, currency)],
                [{ text: "Total Paid", bold: true }, { text: money(bookingData.totalAmount, currency), bold: true }],
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 5, 0, 20],
          },

          {
            text: "This is a system-generated voucher. Please carry a valid government photo ID at the airport. For any assistance, contact FlyAnyTrip support.",
            style: "footerNote",
          },
        ],
        styles: {
          brand: { fontSize: 20, bold: true, color: "#FF2D1A" },
          subheader: { fontSize: 11, color: "#666666" },
          sectionHeader: { fontSize: 13, bold: true, margin: [0, 10, 0, 4], color: "#1A1A1A" },
          label: { fontSize: 9, color: "#666666" },
          value: { fontSize: 13, bold: true, margin: [0, 2, 0, 0] },
          tableHeader: { bold: true, fontSize: 10, color: "#333333" },
          footerNote: { fontSize: 8, color: "#999999", margin: [0, 20, 0, 0] },
        },
        defaultStyle: { fontSize: 10 },
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];

      pdfDoc.on("data", (chunk) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", (err) => reject(err));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
};
