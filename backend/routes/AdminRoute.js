import express from "express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../middleware/auth.js";
import Admin from "../models/AdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = process.env.JWT_SECRET;

// No limit on login attempts before this meant a script could try passwords
// forever. 10 tries per 15 min per IP is enough for a real admin who mistypes
// a password but too slow to be useful for brute-forcing one.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin Login
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Reject non-string input so query operators (e.g. { $ne: ... }) cannot reach the filter
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Invited admins (added via /admin/invite) have no password at all -
    // they can only sign in with Google. bcrypt.compare would throw on an
    // undefined hash, so check for that case explicitly first.
    if (!admin.password) {
      return res
        .status(400)
        .json({ message: "This account can only sign in with Google" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // Previously leaked raw error message:
    // res.status(500).json({ message: "Error logging in", error: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Admin Registration - this used to have no auth check at all, meaning
// anyone could create their own admin account (the most severe part of
// Finding #1's Broken Access Control, missed by the earlier fix to the
// other routes). Only an existing admin can create another one now; the
// very first admin has to be seeded directly in the database, not through
// this API.
router.post("/register", requireAdmin, async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    // Reject non-string input so query operators (e.g. { $ne: ... }) cannot reach the filter
    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Username and password must be strings" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // email is optional - only needed if this admin wants to also be able
    // to sign in with Google (see oauthRoute.js).
    const newAdmin = new Admin({ username, password: hashedPassword, email });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // Previously leaked raw error message:
    // res.status(500).json({ message: "Error registering admin", error: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// Add a Google-only admin: an existing admin names someone by email, and
// that's the entire account - no username, no password. They can only get
// in via "Sign in with Google" (oauthRoute.js), which looks up admins by
// this same email field.
router.post("/invite", requireAdmin, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An admin with this email already exists" });
    }

    const invitedAdmin = new Admin({ name, email });
    await invitedAdmin.save();
    res.status(201).json({ message: "Admin invited successfully" });
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.error("Error inviting admin:", error);
    // res.status(500).json({ message: "Error inviting admin", error: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

// List every admin for the dashboard's Admins page - local and invited,
// never the password hash.
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const admins = await Admin.find({}, "-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    // =========================================================================
    // [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
    // console.error("Error listing admins:", error);
    // res.status(500).json({ message: "Error listing admins", error: error.message });
    // =========================================================================
    // [HARDENED FIX]: Delegate error to centralized error handling middleware
    next(error);
  }
});

export default router;