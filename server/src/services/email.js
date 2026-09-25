import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export const sendBookingVoucherEmail = async (toEmail, subject, text, htmlContent, pdfBuffer, filename) => {
  try {
    const info = await transporter.sendMail({
      from: `"FlyAnyTrip" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: text,
      html: htmlContent,
      attachments: pdfBuffer
        ? [
            {
              filename: filename || "booking_voucher.pdf",
              content: pdfBuffer,
            },
          ]
        : [],
    });
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer Email Error:", error);
    return { success: false, error: error.message };
  }
};
