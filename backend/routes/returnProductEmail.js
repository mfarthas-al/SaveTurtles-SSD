// routes/bookingEmail.js
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Email sending endpoint
router.post("/", requireAdmin, async (req, res) => {
  const { email, status } = req.body; // Get email and status from the request body

  let subject, text;
  if (status === "approved") {
    subject = "SaveTurtle Return product Approved";
    text = "Your SaveTurtle Return product is approved!";
  } else if (status === "disapproved") {
    subject = "SaveTurtle Return product Disapproved";
    text = "Your SaveTurtle Return product is disapproved!";
  }

  // Nodemailer transporter configuration
  const transporter = nodemailer.createTransport({
    service: "gmail", // or any email service provider like Outlook, Yahoo, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Sending the email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
    res.status(200).send("Email sent successfully");
  } catch (error) {
    res.status(500).send("Error sending email: " + error.message);
  }
});

// Export the router as default
export default router;
