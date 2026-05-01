# HW15-A — Google OAuth 2.0 with Passport.js

## Hana Hideaway B&B | ICS 385 Spring 2026 | Noah Munz

### What This Does
Standalone Express app demonstrating Google OAuth 2.0 authentication using passport-google-oauth20. Users sign in with Google, their profile is saved to MongoDB Atlas, and they are redirected to a protected profile page.

### Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Run `node app.js`
5. Open `http://localhost:3000`

### Screenshots
(Add screenshots here)

### Reflection
Google OAuth simplified authentication by eliminating the need to manage password hashing, storage, and reset flows entirely — Google handles all of that securely on their end. Instead of storing sensitive credentials, the app only stores a googleId, email, and display name. However, it added new responsibilities: registering an OAuth client in Google Cloud Console, managing Client ID and Secret securely in .env, configuring correct redirect URIs, and understanding the authorization code exchange flow. The biggest lesson was that federated identity shifts security responsibility rather than eliminating it — you still need to protect your client secret just as carefully as you would a database password.

### AI Tools Used
Claude (Anthropic) assisted with Passport.js GoogleStrategy configuration, EJS template structure, and session middleware ordering.
