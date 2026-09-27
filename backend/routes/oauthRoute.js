import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Admin from "../models/AdminModel.js";

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:5555/auth/google/callback";
// Same secret AdminRoute.js signs the password-login JWT with, so a token
// from either login method is checked the same way everywhere else.
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const oauthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// There's no session middleware in this app, so we can't stash a random
// "state" value server-side to check later like most OAuth examples do.
// Instead we sign the state ourselves (HMAC over a timestamp) so the
// callback can verify it came from a redirect we actually issued, without
// needing anywhere to store it in between.
function signState() {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

// Checks the state came from signState() above, and that it's not too old
// (10 min - long enough for someone to actually log in to Google, short
// enough that an old redirect link can't be replayed later).
function verifyState(state) {
  const [timestamp, signature] = String(state || "").split(".");
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(timestamp)
    .digest("hex");

  // Compare lengths first - timingSafeEqual throws on mismatched lengths,
  // and a length check alone leaks nothing useful to an attacker.
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const ageMs = Date.now() - Number(timestamp);
  return ageMs >= 0 && ageMs < 10 * 60 * 1000;
}

// Step 1 of the OAuth flow: send the browser to Google's consent screen.
router.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state: signState(),
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Step 2: Google redirects back here with a one-time code. Exchange it for
// tokens, then verify the ID token's signature so we know the identity
// actually came from Google and wasn't forged.
router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;

  // Errors send the browser back to the login page with a message in the
  // query string instead of showing raw JSON/text, since a real browser is
  // what lands here (not an API client).
  const failWithError = (message) =>
    res.redirect(`${FRONTEND_URL}/admin?oauth_error=${encodeURIComponent(message)}`);

  if (!verifyState(state)) {
    return failWithError("Login attempt expired or invalid, please try again.");
  }
  if (!code) {
    return failWithError("Google did not return an authorization code.");
  }

  try {
    const { tokens } = await oauthClient.getToken(code);
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Require Google to vouch for the email too, not just return one -
    // email_verified is false for accounts Google itself hasn't confirmed.
    if (!payload.email_verified) {
      return failWithError("Google account email is not verified.");
    }

    // This is the actual access-control decision: Google confirming someone's
    // identity is not enough on its own to grant admin access. They must
    // already be an admin whose account has this email linked (set via
    // /admin/register or by an existing admin updating their own record).
    // There is no self-service path from "has a Google account" to "is an
    // admin" - that would just recreate Finding #1 through a different door.
    const admin = await Admin.findOne({ email: payload.email });
    if (!admin) {
      return failWithError(
        "This Google account is not linked to an admin account. Ask an existing admin to add your email first."
      );
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Hand the token to the frontend via a one-time redirect rather than
    // showing it as JSON in the browser - OAuthCallback.jsx picks it up,
    // stores it exactly like the password-login flow does, then navigates
    // to the dashboard.
    return res.redirect(`${FRONTEND_URL}/admin/oauth-callback?token=${token}`);
  } catch (error) {
    console.error("Google OAuth callback error:", error.message);
    return failWithError("Google sign-in failed.");
  }
});

export default router;
