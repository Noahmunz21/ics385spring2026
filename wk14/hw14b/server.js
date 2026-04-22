require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const User = require('./models/User');

const app = express();

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(3001, () => console.log('Server running on http://localhost:3001'));
  })
  .catch(err => console.error('MongoDB error:', err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport
require('./passport-config')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// ── ROUTES ──────────────────────────────────────────────────────────────────

// GET /register
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Register</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 80px auto; padding: 0 20px; }
        h1 { color: #2c7a4b; }
        input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #2c7a4b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        a { color: #2c7a4b; }
      </style>
    </head>
    <body>
      <h1>🌺 Register</h1>
      <form method="POST" action="/register">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </body>
    </html>
  `);
});

// POST /register
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.send('User already exists. <a href="/register">Try again</a>');
    const user = new User({ email, password });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user.');
  }
});

// GET /login
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/profile');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 80px auto; padding: 0 20px; }
        h1 { color: #2c7a4b; }
        input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #2c7a4b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        a { color: #2c7a4b; }
      </style>
    </head>
    <body>
      <h1>🌺 Login</h1>
      <form method="POST" action="/login">
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>No account? <a href="/register">Register</a></p>
    </body>
    </html>
  `);
});

// POST /login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

// GET /profile — protected
app.get('/profile', isAuthenticated, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profile</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 80px auto; padding: 0 20px; }
        h1 { color: #2c7a4b; }
        .card { background: #f0f7f3; border-radius: 10px; padding: 20px; margin: 20px 0; }
        a { color: white; background: #2c7a4b; padding: 10px 20px; border-radius: 6px; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1>🌺 Profile</h1>
      <div class="card">
        <p><strong>Email:</strong> ${req.user.email}</p>
        <p><strong>Role:</strong> ${req.user.role}</p>
      </div>
      <a href="/logout">Logout</a>
    </body>
    </html>
  `);
});

// GET /logout
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

// Start server
(3001, () => console.log('Server running on http://localhost:3001'));
