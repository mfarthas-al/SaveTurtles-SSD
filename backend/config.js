// =========================================================================
// [ORIGINAL INSECURE CODE - FOR AUDIT SCREENSHOT]
// Previously, port and database URI were hardcoded:
// export const PORT = 5555;
// export const mongoDBURL = "mongodb://localhost:27017/MERNProject";
// =========================================================================
// [HARDENED FIX]: Load configuration dynamically from environment variables
export const PORT = process.env.PORT || 5555;

export const mongoDBURL =
  process.env.MONGODB_URL ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/MERNProject";

