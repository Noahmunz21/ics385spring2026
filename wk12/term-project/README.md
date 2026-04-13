Hana Hideaway B&B is a full-stack web application for a locally-owned bed and breakfast in the rainforests of Hana, Maui.
The app has three pages: (1) a Marketing Page targeting eco-tourists with property info and a booking call-to-action; (2) a
Visitor Statistics Dashboard showing real Hawaii tourism data from DBEDT with interactive charts; and (3) a
password-protected Admin Panel for the property owner to post special offers and manage content. The backend uses
Node.js, Express, and MongoDB Atlas; the frontend uses React with Vite.

What has been completed so far (Weeks 10–11):

• Week 10: Mongoose Property schema created with 5 seeded Maui B&B records in MongoDB Atlas.

• Week 11: Express server with GET /properties, GET /properties/:id, and POST 
/properties/:id/reviews routes. EJS template rendering all properties. Postman collection tested and exported.

• Week 12: React marketing page built with Hero, About, Amenities, and CallToAction components. Data fetched live from Express API using useEffect and useState.

### What I Built: 
This is a React-based marketing page for Hana Hideaway B&B, a fictional locally-owned bed and breakfast located in Hana, Maui, Hawaii. The page includes four sections: a Hero section with a Maui beach photo and tagline, an About section describing the property, an Amenities section displaying available features in a responsive grid, and a Call-to-Action section with a booking button. Property data is fetched dynamically from a custom Express.js REST API using React's useState and useEffect hooks. The page is fully responsive and readable on mobile screens as small as 375px wide, and follows WCAG 2.1 AA accessibility guidelines, including descriptive image alt text and sufficient color contrast.

<img width="1139" height="694" alt="Screenshot 2026-04-09 at 6 11 48 PM" src="https://github.com/user-attachments/assets/75286da0-4488-4a17-9f36-bd501e30ae79" />

<img width="1138" height="694" alt="Screenshot 2026-04-09 at 6 12 04 PM" src="https://github.com/user-attachments/assets/b505648e-fcab-45d1-88e2-8ef14af13e1a" />



AI Tools Used:

• Claude (Anthropic)
