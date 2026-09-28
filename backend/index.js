import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import eventRoute from "./routes/eventRoute.js";
import cors from "cors";
import eventParticipantRoute from "./routes/eventParticipentRoute.js";
import { fileURLToPath } from "url";
import path from "path";
import bookingEmail from "./routes/bookingEmail.js";
import adminRoute from "./routes/AdminRoute.js";
import faqRouter from "./routes/faqRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import productRoute from "./routes/productRoute.js";
import purchaseRoute from "./routes/purchaseRoute.js";
import refundRoute from "./routes/refundRoutes.js";
import ReturnRouter from "./routes/ReturnsRoute.js";
import donationsRoute from "./routes/donationsRoute.js";
import purchaseEmail from "./routes/purchaseEmail.js";
import donationEmail from "./routes/donationEmail.js";
import saveMeRouter from "./routes/saveMeRoutes.js";
import returnProductEmail from "./routes/returnProductEmail.js";
import MembershipRouter from "./routes/membershipsRoute.js";
import SubscriptionRouter from "./routes/subscriptionRoute.js";
import subEmailRouter from "./routes/subscriptionEmail.js";

import refundEmail from "./routes/refundEmail.js";

// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, no HTTP security headers were configured and X-Powered-By was exposed by default:
// const app = express();
// =========================================================================
// [HARDENED FIX]: Disable Express server banner and apply Helmet security headers
const app = express();
app.disable("x-powered-by");
app.use(helmet());

// Middleware for parsing request body
app.use(express.json());

// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, open wildcard CORS allowed any origin without restriction:
// app.use(cors());
// =========================================================================
// [HARDENED FIX]: Restrict CORS to explicit allowlist, specific methods, and headers
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server) or matching allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Setup for ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, raw uploaded static files were served without defensive security headers:
// app.use("/uploads/eventPayment", express.static(path.join(__dirname, "uploads/eventPayment")));
// app.use("/uploads/productImage", express.static(path.join(__dirname, "uploads/productImage")));
// app.use("/uploads/purchasePayment", express.static(path.join(__dirname, "uploads/purchasePayment")));
// app.use("/uploads/receipts", express.static(path.join(__dirname, "uploads/receipts")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// =========================================================================
// [HARDENED FIX]: Serve static uploads with defensive headers (nosniff & CSP) to prevent script execution
const staticUploadOptions = {
  setHeaders: (res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'");
  },
};

// Serve static files with defensive headers
app.use(
  "/uploads/eventPayment",
  express.static(path.join(__dirname, "uploads/eventPayment"), staticUploadOptions)
);

app.use(
  "/uploads/productImage",
  express.static(path.join(__dirname, "uploads/productImage"), staticUploadOptions)
);

app.use(
  "/uploads/purchasePayment",
  express.static(path.join(__dirname, "uploads/purchasePayment"), staticUploadOptions)
);

app.use(
  "/uploads/receipts",
  express.static(path.join(__dirname, "uploads/receipts"), staticUploadOptions)
);

app.get("/", (request, response) => {
  console.log(request);
  return response.status(234).send("MERN Testing");
});

// Event Routes
app.use("/events", eventRoute);
app.use("/eventViews", eventRoute);
app.use("/eventViews/eventParticipants", eventParticipantRoute);
app.use("/eventBookingList", eventParticipantRoute);
app.use("/sendEmail", bookingEmail);
app.use("/faq", faqRouter);
app.use("/tickets", ticketRouter);
app.use("/returns", ReturnRouter);

// Product Routes
app.use("/products", productRoute);
app.use("/productViews", productRoute);
app.use("/productViews/purchaseForm", purchaseRoute);
app.use("/purchaseList", purchaseRoute);
app.use("/sendPurchaseEmail", purchaseEmail);

// Refund Routes
app.use("/refunds", refundRoute);
app.use("/userRefunds", refundRoute);
app.use("/sendRefundEmail", refundEmail);

// donations Route
app.use("/donations", donationsRoute);
app.use("/sendDonationEmail", donationEmail);

//login
app.use("/admin", adminRoute);
app.use("/admin/register", adminRoute);

// Product Routes
app.use("/products", productRoute);
app.use("/productViews", productRoute);
app.use("/productViews/purchaseForm", purchaseRoute);
app.use("/purchaseList", purchaseRoute);

//SaveMe Routes
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), staticUploadOptions)
);
app.use("api/saveMe", saveMeRouter);

app.use("/returnProductsendEmail", returnProductEmail);

//Membership route
app.use("/memberships", MembershipRouter);
app.use("/subscriptions", SubscriptionRouter);
app.use("/sendSubEmail", subEmailRouter);

// =========================================================================
// [ORIGINAL INSECURE PATTERN - FOR AUDIT SCREENSHOT]
// Previously, individual route handlers returned raw error.message directly in 500 responses:
// catch (error) {
//   response.status(500).send({ message: error.message });
// }
// =========================================================================
// [HARDENED FIX]: Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Log complete stack trace internally to server console for debugging
  console.error("Internal Server Error:", err.stack || err);

  const statusCode = err.statusCode || err.status || 500;

  // In production, return generic safe message to prevent leaking internal stack/schema details
  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      message: "An unexpected error occurred. Please contact administrator.",
    });
  }

  // In development/test environments, output diagnostic error details
  return res.status(statusCode).json({
    message: err.message || "An unexpected error occurred.",
    error: err.toString(),
    stack: err.stack,
  });
});

mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to the Database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
