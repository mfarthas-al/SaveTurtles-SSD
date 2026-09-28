import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Allowed MIME types and extensions allowlist
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Creates a configured, hardened Multer upload instance.
 * @param {string} destination - Target directory for uploads (relative to backend root)
 */
export const createSecureUpload = (destination = "uploads/") => {
  // Ensure target upload directory exists
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      // Discard user-supplied filename to prevent path traversal & special character attacks
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${crypto.randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

    if (isMimeAllowed && isExtAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and PDF files are permitted."
        ),
        false
      );
    }
  };

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter,
  });
};

export default createSecureUpload;
