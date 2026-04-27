const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/admin/dashboard');
  const error = req.query.error;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Login — Hana Hideaway B&B</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #f0f7f3; min-height: 100vh;
               display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .card { background: white; border-radius: 12px; padding: 2.5rem;
                box-shadow: 0 4px 16px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
        .logo { text-align: center; margin-bottom: 1.5rem; }
        .logo h1 { color: #2c7a4b; font-size: 1.5rem; }
        .logo p { color: #555; font-size: 0.9rem; margin-top: 4px; }
        label { display: block; font-weight: bold; color: #333; margin-bottom: 4px; font-size: 0.9rem; }
        input { width: 100%; padding: 0.65rem 1rem; border: 1.5px solid #ccc;
                border-radius: 8px; font-size: 1rem; margin-bottom: 1rem; }
        input:focus { outline: none; border-color: #2c7a4b; }
        button { width: 100%; padding: 0.75rem; background: #2c7a4b; color: white;
                 border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; }
        button:hover { background: #1f5c37; }
        .error { background: #fee2e2; color: #b91c1c; padding: 0.75rem 1rem;
                 border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
        @media (max-width: 375px) { .card { padding: 1.5rem; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">
          <h1>🌺 Hana Hideaway B&B</h1>
          <p>Admin Portal — Please log in to continue</p>
        </div>
        ${error ? '<div class="error">⚠️ Invalid credentials. Please try again.</div>' : ''}
        <form method="POST" action="/admin/login">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="admin@hanahideaway.com" required />
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required />
          <button type="submit">Log In</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin/dashboard',
  failureRedirect: '/admin/login?error=1'
}));

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/admin/login'));
});

module.exports = router;
