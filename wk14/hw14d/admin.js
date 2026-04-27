const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const Property = require('../models/Property');

router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const properties = await Property.find({});
    const totalReviews = properties.reduce((sum, p) => sum + p.reviews.length, 0);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard — Hana Hideaway B&B</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: #f0f7f3; min-height: 100vh; }
          header { background: #2c7a4b; color: white; padding: 1rem 2rem;
                   display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
          header h1 { font-size: 1.3rem; }
          header p { font-size: 0.85rem; opacity: 0.85; }
          .logout { color: white; background: rgba(255,255,255,0.2); padding: 0.4rem 1rem;
                    border-radius: 20px; text-decoration: none; font-size: 0.9rem; }
          .logout:hover { background: rgba(255,255,255,0.35); }
          main { padding: 2rem; max-width: 900px; margin: 0 auto; }
          .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                     gap: 1rem; margin-bottom: 2rem; }
          .metric { background: white; border-radius: 10px; padding: 1.2rem; text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-top: 4px solid #2c7a4b; }
          .metric .val { font-size: 2rem; font-weight: bold; color: #2c7a4b; }
          .metric .lbl { font-size: 0.85rem; color: #555; margin-top: 4px; }
          h2 { color: #2c7a4b; margin-bottom: 1rem; font-size: 1.2rem; }
          table { width: 100%; border-collapse: collapse; background: white;
                  border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
          th { background: #2c7a4b; color: white; padding: 0.75rem 1rem; text-align: left; font-size: 0.9rem; }
          td { padding: 0.75rem 1rem; border-bottom: 1px solid #e8f5e9; font-size: 0.9rem; color: #333; }
          tr:last-child td { border-bottom: none; }
          tr:nth-child(even) td { background: #f9fdf9; }
          .badge { background: #e8f5e9; color: #2c7a4b; padding: 2px 8px;
                   border-radius: 10px; font-size: 0.8rem; font-weight: bold; }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>🌺 Hana Hideaway B&B — Admin Dashboard</h1>
            <p>Welcome back! Logged in as: <strong>${req.user.email}</strong></p>
          </div>
          <a href="/admin/logout" class="logout">Logout</a>
        </header>
        <main>
          <div class="metrics">
            <div class="metric">
              <div class="val">${properties.length}</div>
              <div class="lbl">Total Properties</div>
            </div>
            <div class="metric">
              <div class="val">${totalReviews}</div>
              <div class="lbl">Guest Reviews</div>
            </div>
            <div class="metric">
              <div class="val">Maui</div>
              <div class="lbl">Island</div>
            </div>
          </div>
          <h2>📋 All Properties</h2>
          <table>
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Type</th>
                <th>Target Segment</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              ${properties.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.type}</td>
                  <td><span class="badge">${p.targetSegment}</span></td>
                  <td>${p.reviews.length} review${p.reviews.length !== 1 ? 's' : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </main>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard.');
  }
});

module.exports = router;
