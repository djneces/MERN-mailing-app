const passport = require('passport');

//export and passing app
module.exports = (app) => {
  app.get(
    '/auth/google',

    //GoogleStrategy => 'google (internal identifier of Passport)
    passport.authenticate('google', {
      //access to user's profile and email
      scope: ['profile', 'email'],
    })
  );

  //once we logged in on /auth/google it redirects us, we handle it here via passport (google gives us code in the URL)
  //passport exchanges with Google this code for a user's profile -> we get accessToken needed in callback in GoogleStrategy
  app.get('/auth/google/callback', passport.authenticate('google'));
};
