import express from "express";
import Admin from "../models/AdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
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
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// Admin Registration
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

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
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error in admin registration:", error);
    res
      .status(500)
      .json({ message: "Error registering admin", error: error.message });
  }
});

export default router;
