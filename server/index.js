import 'dotenv/config';
import app from "./src/app.js";
import { warmUpAdivahaSession } from "./src/services/adivaha.js";

// Defense-in-depth: a bug in a background/fire-and-forget promise (e.g. the
// PDF/email generation kicked off after a booking, which isn't awaited by
// any Express route handler and so Express's own error handling never sees
// it) can otherwise crash the entire process with no chance to respond to
// in-flight requests. That's exactly what happened here — a pdfmake API
// mismatch inside the post-payment confirmation email flow took the whole
// server down mid-session. The underlying bug is fixed (see
// src/services/pdf.js), but this logs any future "shouldn't happen" errors
// instead of silently killing a server that may be mid-payment for someone
// else, which is far worse than one email failing to send.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] Not crashing the server for this — investigate:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException] Not crashing the server for this — investigate:", err);
});

const PORT = process.env.PORT || 5000;

// Establish the Adivaha session token as soon as the server boots, rather
// than waiting for the first real user request to discover (mid-checkout)
// that ADIVAHA_PID/ADIVAHA_API_KEY are wrong or that authentication is
// failing. Fire-and-forget: adivaha.js logs the outcome either way, and
// every subsequent Adivaha call re-checks/re-creates the token itself if
// this hasn't finished yet or needs a refresh.
try {
  warmUpAdivahaSession();
} catch (err) {
  console.error("[Warmup Error] Adivaha session warmup failed on startup:", err);
}

// Only listen if not running as a Vercel Serverless Function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;