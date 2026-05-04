const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');

// GET /admin/login
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
        .btn-local { width: 100%; padding: 0.75rem; background: #2c7a4b; color: white;
                     border: none; border-radius: 8px; font-size: 1rem;
                     font-weight: bold; cursor: pointer; margin-bottom: 1rem; }
        .btn-local:hover { background: #1f5c37; }
        .btn-google { width: 100%; padding: 0.75rem; background: white; color: #333;
                      border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;
                      font-weight: bold; cursor: pointer; display: flex;
                      align-items: center; justify-content: center; gap: 10px;
                      text-decoration: none; }
        .btn-google:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .btn-google img { width: 20px; height: 20px; }
        .divider { text-align: center; color: #aaa; margin: 1rem 0; font-size: 0.85rem; }
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
        <a href="/auth/google" class="btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
          Sign in with Google
        </a>
        <div class="divider">— or sign in with email —</div>
        <form method="POST" action="/admin/login">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="admin@hanahideaway.com" required />
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required />
          <button type="submit" class="btn-local">Log In</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// POST /admin/login with validation
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.redirect('/admin/login?error=1');
    next();
  },
  passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin/login?error=1'
  })
);

// Google OAuth routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/admin/login?error=1' }),
  (req, res) => res.redirect('/admin/dashboard')
);

// GET /admin/logout
router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/admin/login'));
});

module.exports = router;
