import mongoose from "mongoose";

// Two kinds of admin live in this same collection:
//  - "local" admins: username + password, log in with the normal form
//  - "invited" admins: name + email only, no password - can only log in
//    via "Sign in with Google" (oauthRoute.js), and only because an
//    existing admin added their email through /admin/invite
// username/password are no longer required so invited admins can omit
// them; sparse indexes mean multiple admins can each have neither set
// without colliding on a null/null unique conflict.
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
