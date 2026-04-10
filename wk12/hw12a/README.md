# Week 12 - React Marketing Page
## Hana Hideaway B&B — Maui Marketing Page

A React-based marketing page for Hana Hideaway B&B, targeting eco-tourists visiting Maui.

### What I Built: 
This is a React-based marketing page for Hana Hideaway B&B, a fictional locally-owned bed and breakfast located in Hana, Maui, Hawaii. The page includes four sections: a Hero section with a Maui beach photo and tagline, an About section describing the property, an Amenities section displaying available features in a responsive grid, and a Call-to-Action section with a booking button. Property data is fetched dynamically from a custom Express.js REST API using React's useState and useEffect hooks. The page is fully responsive and readable on mobile screens as small as 375px wide, and follows WCAG 2.1 AA accessibility guidelines, including descriptive image alt text and sufficient color contrast.

### Features
- Hero section with Maui beach photo and tagline
- About section fetched from Express API
- Amenities grid mapped from props
- Call-to-Action with booking button
- Responsive CSS Grid layout (mobile ≥ 375px)
- WCAG 2.1 AA compliant (alt attributes, color contrast)

### Technology Stack
- React 18 + Vite
- CSS Grid / Flexbox
- Express API (localhost:3000)

### Setup Instructions
1. Make sure MongoDB Atlas is connected (credentials in .env file)
2. In your terminal, navigate to the backend folder and start the Express server by running node server.js — this powers the API that supplies property data
3. In a second terminal window, navigate to this folder (hw12a) and run npm run dev to start the React app
4. Open your browser and go to http://localhost:5173 to view the marketing page

### AI Tools Used
- Claude (Anthropic) — assisted with React component structure, CSS styling, and CORS configuration
