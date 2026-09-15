import { Queue, Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import { generateBookingPDF } from "../services/pdf.js";
import { sendBookingVoucherEmail } from "../services/email.js";

// Queue setup
export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,
});

// Worker processing logic
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { email, bookingData } = job.data;
    console.log(`Processing email job for booking: ${bookingData.id}`);

    // 1. Generate PDF
    const pdfBuffer = await generateBookingPDF(bookingData);

    // 2. Send email with PDF attachment
    const htmlContent = `
      <h1>Your Booking is Confirmed!</h1>
      <p>Thank you for booking with FlyAnyTrip. Your ticket voucher is attached below.</p>
    `;

    await sendBookingVoucherEmail(
      email,
      "FlyAnyTrip - Booking Confirmation Voucher",
      "Your booking is confirmed. Please find your travel voucher attached.",
      htmlContent,
      pdfBuffer,
      `Voucher_${bookingData.id}.pdf`
    );
  },
  {
    connection: redisConnection,
  }
);

emailWorker.on("completed", (job) => console.log(`Job completed: ${job.id}`));
emailWorker.on("failed", (job, err) => console.error(`Job failed: ${job.id} | Error: ${err}`));

export default emailWorker;
