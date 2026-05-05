# 🌺 Hana Hideaway B&B — Hawaii Hospitality Dashboard

**Live URL: https://ics385spring2026-l4ee.onrender.com**

A full-stack Hawaii hospitality web application built for ICS 385 Spring 2026.

## Pages
- **Marketing Page** — `/properties` — React-based page targeting eco-tourists
- **Admin Login** — `/admin/login` — Local + Google OAuth authentication
- **Admin Dashboard** — `/admin/dashboard` — Protected property management panel

## Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials
4. Run `node seed-admin.js` to create admin account
5. Run `node server.js`
6. Open `http://localhost:3000`

## Technology Stack
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- Passport.js (Local Strategy + Google OAuth 2.0)
- bcrypt password hashing
- express-session + Helmet.js
- express-validator
- React + Vite (marketing page)
- Chart.js (visitor dashboard)
- OpenWeatherMap API
- EJS templating
- Jest + Supertest (integration tests)

## Admin Credentials
- Email: `admin@hanahideaway.com`
- Password: documented in seed-admin.js (not committed)

## Acceptance Criteria Results
| AC | Feature | Result |
|---|---|---|
| AC-1 | Marketing page loads | ✅ Pass |
| AC-2 | Dashboard charts render | ✅ Pass |
| AC-3 | Local sign-up creates hashed user | ✅ Pass |
| AC-4 | Local sign-in redirects to dashboard | ✅ Pass |
| AC-5 | Google OAuth sign-in works | ✅ Pass |
| AC-6 | Protected route redirects unauthenticated | ✅ Pass |
| AC-7 | Logout clears session | ✅ Pass |
| AC-8 | No secrets in GitHub repo | ✅ Pass |

## Test Output
Run `npm test` to execute Jest + Supertest integration tests.

## AI Tools Used
Claude (Anthropic) assisted with Passport.js configuration, Google OAuth integration,
bcrypt pre-save hook, Helmet.js setup, express-validator, Jest test scaffolding,
and deployment configuration. All generated code has been reviewed and can be
explained by the student author.

## Weekly Progress
- **Week 10** — Mongoose Property schema, 5 seeded Maui B&B records in MongoDB Atlas
- **Week 11** — Express REST API, EJS template, Postman collection
- **Week 12** — React marketing page with Hero, About, Amenities, CallToAction
- **Week 13** — Chart.js dashboard, OpenWeatherMap widget, Island Cards
- **Week 14** — Passport.js local auth, bcrypt, protected admin dashboard
- **Week 15** — Google OAuth 2.0, Helmet.js, express-validator, Jest tests, Render deployment


## Reflection
This final assignment integrated Google OAuth 2.0 alongside local Passport.js 
authentication, added Helmet.js security headers and express-validator input 
sanitization, and deployed the application to Render. The biggest challenge was 
configuring MongoDB Atlas network access to allow connections from Render's servers 
by whitelisting 0.0.0.0/0. Session persistence on Render requires connect-mongo 
Instead of MemoryStore for production, which is a planned improvement. 

AI Tools Used: Claude (Anthropic) assisted with OAuth integration, Helmet configuration, 
and deployment troubleshooting.

## Screenshots
### Admin Login Page
![Admin Login](<img width="1122" height="769" alt="Screenshot 2026-05-04 at 8 22 31 PM" src="https://github.com/user-attachments/assets/5e1510d8-94d5-43c8-ac77-d0b17e90e9c0" />
)

### Admin Dashboard
![Admin Dashboard](<img width="1124" height="692" alt="Screenshot 2026-05-04 at 8 45 25 PM" src="https://github.com/user-attachments/assets/5dfea473-74ce-4b2d-99cb-203364fd267f" />
)

### Jest Test Output
![Jest Tests](<img width="1115" height="770" alt="Screenshot 2026-05-04 at 8 25 37 PM" src="https://github.com/user-attachments/assets/f2a15786-c500-4577-a628-40dbf2052378" />
)

### MongoDB Atlas Users Collection
![MongoDB Atlas](<img width="1118" height="690" alt="Screenshot 2026-05-04 at 8 33 57 PM" src="https://github.com/user-attachments/assets/a9566544-34ae-43ac-968f-137ac4af40ab" />
)

ICS 385 Spring 2026 | University of Hawaii Maui College | Noah Munz
