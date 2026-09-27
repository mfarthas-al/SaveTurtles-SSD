import express from "express";
import crypto from "crypto";

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:5555/auth/google/callback";

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

export default router;
