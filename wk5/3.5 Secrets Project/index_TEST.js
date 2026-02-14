// index_TEST.js — Secured version of the Secrets project
// Original: index.js (minimal Express server with hardcoded password)
// This TEST version addresses the security limitations identified in the code review.

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY IMPROVEMENT #1: Use dotenv to load secrets from a .env file.
// The original code had NO password at all — you were meant to add it.
// Hardcoding a password directly in source code is a critical vulnerability
// because anyone with access to the repository can see the secret.
//
// To use this file:
//   1. Run: npm install dotenv
//   2. Create a .env file in the project root (NEVER commit this file to Git):
//        PASSWORD=ILoveProgramming
//   3. Add .env to your .gitignore file
// ─────────────────────────────────────────────────────────────────────────────
import "dotenv/config"; // loads .env into process.env

import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// SECURITY IMPROVEMENT #2: Use a configurable port via environment variable.
// The original solution.js hardcodes port 3000. Using process.env.PORT allows
// the server to run on whatever port the hosting environment assigns.
const port = process.env.PORT || 3000;

// SECURITY IMPROVEMENT #3: Use a session-scoped authorization flag.
// The original code uses a single global boolean (userIsAuthorised) shared
// across ALL users and ALL requests. Once ANY user enters the correct password,
// EVERY subsequent visitor sees the secret page — even without a password!
//
// This TEST version uses a per-request approach: the authorization state is
// derived from the incoming request body only, not stored globally.
// A production app should use express-session or JWT tokens instead.

app.use(bodyParser.urlencoded({ extended: true }));

// SECURITY IMPROVEMENT #4: Extract password check into a reusable middleware.
// This keeps the route handlers clean and makes the logic easy to test/modify.
// The middleware now reads the secret from an environment variable, not source code.
function passwordCheck(req, res, next) {
  const submitted = req.body["password"];
  const correctPassword = process.env.PASSWORD;

  if (!correctPassword) {
    // If no password is configured, refuse all access rather than allowing
    // unauthenticated entry. Fail-safe default.
    console.error("ERROR: PASSWORD environment variable is not set!");
    req.userIsAuthorised = false;
  } else {
    // Simple string comparison. A production system should use bcrypt to
    // compare hashed passwords and avoid timing attacks.
    req.userIsAuthorised = submitted === correctPassword;
  }
  next();
}
app.use(passwordCheck);

// Serve the password form
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Handle password submission
app.post("/check", (req, res) => {
  // SECURITY IMPROVEMENT #5: Read authorization from req (per-request) instead
  // of a global variable. This prevents one user's login from unlocking the
  // secret page for everyone else.
  if (req.userIsAuthorised) {
    res.sendFile(__dirname + "/public/secret.html");
  } else {
    // SECURITY IMPROVEMENT #6: Return a 401 Unauthorized status code on failure.
    // The original code returned 200 OK even on a failed login attempt, which
    // makes it harder for clients/monitoring tools to detect failed auth.
    res.status(401).sendFile(__dirname + "/public/index.html");
  }
});

// SECURITY IMPROVEMENT #7: Add a basic error-handling middleware.
// Express requires this signature (4 args) to recognize it as error middleware.
// Without this, unhandled errors leak stack traces to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  if (!process.env.PASSWORD) {
    console.warn("WARNING: PASSWORD environment variable is not configured.");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY OF REMAINING LIMITATIONS (for further study):
//
// 1. No HTTPS — passwords sent over plain HTTP can be intercepted (man-in-the-
//    middle). In production, serve over HTTPS with a TLS certificate.
//
// 2. No rate limiting — an attacker can try thousands of passwords per second.
//    Add express-rate-limit or a similar package to throttle login attempts.
//
// 3. No session management — closing the browser tab "forgets" the user.
//    Use express-session + a session store (e.g., Redis) for persistent auth.
//
// 4. Plain-text password comparison — even though the password is now in .env,
//    it is still stored as plain text. Bcrypt hashing adds another layer of
//    protection if the .env file itself is ever exposed.
//
// 5. No CSRF protection — a malicious third-party page could submit the form
//    on a logged-in user's behalf. Add a CSRF token (e.g., csurf package).
//
// 6. No helmet — the Helmet.js middleware sets secure HTTP headers (e.g.,
//    Content-Security-Policy) that protect against common web attacks.
// ─────────────────────────────────────────────────────────────────────────────
