const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');

module.exports = (passport) => {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false);
        const match = await user.comparePassword(password);
        if (!match) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
