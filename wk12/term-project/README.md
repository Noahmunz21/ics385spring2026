Hana Hideaway B&B is a full-stack web application for a locally-owned bed and breakfast in the rainforests of Hana, Maui.
The app has three pages: (1) a Marketing Page targeting eco-tourists with property info and a booking call-to-action; (2) a
Visitor Statistics Dashboard showing real Hawaii tourism data from DBEDT with interactive charts; and (3) a
password-protected Admin Panel for the property owner to post special offers and manage content. The backend uses
Node.js, Express, and MongoDB Atlas; the frontend uses React with Vite.

What has been completed so far (Weeks 10–11):
• Week 10: Mongoose Property schema created with 5 seeded Maui B&B records in MongoDB Atlas.
• Week 11: Express server with GET /properties, GET /properties/:id, and POST /properties/:id/reviews routes. EJS
template rendering all properties. Postman collection tested and exported.
• Week 12: React marketing page built with Hero, About, Amenities, and CallToAction components. Data fetched live
from Express API using useEffect and useState.
