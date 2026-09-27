// routes/subscriptionEmail.js
import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import nodemailer from "nodemailer";

const subEmailRouter = express.Router();

// Email sending endpoint
subEmailRouter.post("/", requireAdmin, async (req, res) => {
  const { email, status } = req.body; // Get email and status from the request body

  let subject, text;
  if (status === "approved") {
    subject = "Subscription Approved";
    text = `
      Your subscription has been approved!

      Thank you for subscribing to our service. 
      We appreciate your support and look forward to serving you.

      Best regards,
      SaveTurtle Team
    `;
  } else if (status === "disapproved") {
    subject = "Subscription Disapproved";
    text = `
      Your subscription has been disapproved.

      Unfortunately, we could not process your subscription at this time. 
      If you have any questions, feel free to contact us.

      Best regards,
      SaveTurtle Team
    `;
  } else {
    return res.status(400).send("Invalid status");
  }

  // Nodemailer transporter configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "saveturtlescaresl@gmail.com", // sender email
      pass: "vsglcgmwxxtlmlbj", // sender email password
    },
  });

  // Sending the email
  try {
    await transporter.sendMail({
      from: "saveturtlescaresl@gmail.com",
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
export default subEmailRouter;
