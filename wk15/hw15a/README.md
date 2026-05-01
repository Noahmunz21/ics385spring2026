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
<img width="1111" height="688" alt="Screenshot 2026-04-30 at 3 23 51 PM" src="https://github.com/user-attachments/assets/12d3667c-2cd6-488c-9348-d0a0e22f6b74" />
<img width="1107" height="689" alt="Screenshot 2026-04-30 at 3 24 07 PM" src="https://github.com/user-attachments/assets/0eca216a-a05b-444b-b6cf-2e7ed5f7847c" />
<img width="1097" height="682" alt="Screenshot 2026-04-30 at 3 25 21 PM" src="https://github.com/user-attachments/assets/675e9317-c8d0-470b-aac6-d6c38c4b333d" />
<img width="1106" height="774" alt="Screenshot 2026-04-30 at 3 25 39 PM" src="https://github.com/user-attachments/assets/614f2f84-2912-4ee3-a08c-b89e8d2a18d1" />
<img width="1106" height="688" alt="Screenshot 2026-04-30 at 3 27 05 PM" src="https://github.com/user-attachments/assets/36d1c9c5-d7ae-4bd0-afb9-c6d8740abef4" />


### Reflection
Google OAuth simplified authentication by eliminating the need to manage password hashing, storage, and reset flows entirely — Google handles all of that securely on their end. Instead of storing sensitive credentials, the app only stores a googleId, email, and display name. However, it added new responsibilities: registering an OAuth client in Google Cloud Console, managing Client ID and Secret securely in .env, configuring correct redirect URIs, and understanding the authorization code exchange flow. The biggest lesson was that federated identity shifts security responsibility rather than eliminating it — you still need to protect your client secret just as carefully as you would a database password.

### AI Tools Used
Claude (Anthropic) assisted with Passport.js GoogleStrategy configuration, EJS template structure, and session middleware ordering.
