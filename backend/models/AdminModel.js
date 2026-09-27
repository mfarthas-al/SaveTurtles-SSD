import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Optional - lets an admin sign in with Google instead of a password.
  // sparse index so multiple admins without one set don't collide on null.
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
});

export default mongoose.model("Admin", adminSchema);
