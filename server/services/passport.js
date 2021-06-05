const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

//one argument = fetch model out of mongoose, two = load schema into mongoose(like in User.js)
//we don't export User.js and require here => duplicates while testing in e.g. Jest (gives error) and using mongoose
// User = model class => relation to the DB collection users, we use this class to create an instance => each record in the collection
const User = mongoose.model('users');

//user here === (existingUser or user - in done func)
passport.serializeUser((user, done) => {
  //user.id === _id in DB
  //token saved into the cookie
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    //pulled out the user from the DB
    //appears as req.user
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      //URL to redirect user after they are granted access by Google
      callbackURL: '/auth/google/callback',
      //we need to trust Heroku's proxy (there was a http vs https callback path error)
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      //check if user exists
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        //when finished => call done (1st argument is err)
        return done(null, existingUser);
      }
      //saving user into the DB
      const user = await new User({ googleId: profile.id }).save();
      //user-> newly created user, we use this one -> reflecting possible changes while saving into DB
      done(null, user);
    }
  )
);
