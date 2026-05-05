require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'mauibnbsecret2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport
require('./passport-config')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
const propertiesRouter = require('./routes/properties');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

app.use('/properties', propertiesRouter);
app.use('/admin', authRouter);
app.use('/admin', adminRouter);
app.use('/', authRouter); // for /auth/google routes

app.get('/', (req, res) => {
  res.redirect('/properties');
});

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Connection error:', err);
    // Don't exit — keep process alive for debugging
  });

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

module.exports = app;
