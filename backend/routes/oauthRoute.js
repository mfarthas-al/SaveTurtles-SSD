import express from "express";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:5555/auth/google/callback";

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

  if (!verifyState(state)) {
    return res
      .status(400)
      .send("Login attempt expired or invalid, please try signing in again.");
  }
  if (!code) {
    return res.status(400).send("Google did not return an authorization code.");
  }

  try {
    const { tokens } = await oauthClient.getToken(code);
    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // TEMPORARY for this step: just prove we can reach a verified Google
    // identity end to end. Next commit restricts this to existing admins
    // and issues our own JWT instead of exposing the Google payload.
    return res.json({
      message: "Google identity verified",
      email: payload.email,
      emailVerified: payload.email_verified,
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error.message);
    return res.status(401).send("Google sign-in failed.");
  }
});

export default router;
