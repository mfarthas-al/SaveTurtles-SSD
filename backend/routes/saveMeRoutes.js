import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import multer from "multer";
import {
  addSaveMe,
  getSaveMeById,
  updateSaveMe,
  deleteSaveMe,
  getAllSaveMes, // Import the new controller function
} from "../controllers/saveMeController.js";

import { createSecureUpload } from "../middleware/upload.js";

// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, raw user filenames, unbounded file size, and no MIME/ext filters:
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });
// =========================================================================
// [HARDENED FIX]: Centralized secure upload with UUID naming, type allowlist, and 5MB limit
const upload = createSecureUpload("uploads/");

const saveMeRouter = express.Router();

// Route to create a new SaveMe report with image upload
saveMeRouter.post("/add", upload.single("photo"), addSaveMe);

// Route to get all SaveMe reports
saveMeRouter.get("/", getAllSaveMes); // New route to fetch all reports

// Route to get a SaveMe report by ID
saveMeRouter.get("/:id", getSaveMeById);

// Route to update a SaveMe report by ID with optional image upload
saveMeRouter.put("/:id", requireAdmin, upload.single("photo"), updateSaveMe);

// Route to delete a SaveMe report by ID
saveMeRouter.delete("/:id", requireAdmin, deleteSaveMe);

export default saveMeRouter;
