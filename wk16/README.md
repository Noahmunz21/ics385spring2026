# Week 16 — Final Code Review
## Hana Hideaway B&B | Noah Munz | ICS 385 Spring 2026

## Live Deployment
https://ics385spring2026-l4ee.onrender.com - only properties & /admin/login page were working at the time of the live code review. 
Used localhost to show the dashboard, marketing, and the /admin/login database.

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

## Final Codebase
The complete Term Project is located in wk15/term-project/

## Weekly Work Summary
- **Week 10** — Mongoose Property schema, 5 seeded records in MongoDB Atlas
- **Week 11** — Express REST API, EJS template, Postman collection
- **Week 12** — React marketing page with live API data
- **Week 13** — Chart.js dashboard, OpenWeatherMap weather widget
- **Week 14** — Passport.js local auth, bcrypt, admin dashboard
- **Week 15** — Google OAuth 2.0, Helmet.js, Render deployment

## PRD
docs/PRD_v3_MunzNoah.pdf

## AI Tools Used
Claude (Anthropic) assisted throughout the project with debugging,
component structure, authentication configuration, and deployment.
All generated code has been reviewed and can be explained by the student.
