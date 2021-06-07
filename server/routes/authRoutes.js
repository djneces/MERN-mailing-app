const passport = require('passport');

//export and passing app
module.exports = (app) => {
  app.get('/api', (req, res) => {
    console.log('hit');
    res.send('<h1>Hi from API</h1>');
  });
  app.get(
    '/auth/google',

    //GoogleStrategy => 'google (internal identifier of Passport)
    passport.authenticate('google', {
      //access to user's profile and email
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })
  );

  //once we logged in on /auth/google it redirects us, we handle it here via passport (google gives us code in the URL)
  //passport exchanges with Google this code for a user's profile -> we get accessToken needed in callback in GoogleStrategy
  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/surveys');
    }
  );

  app.get('/api/logout', (req, res) => {
    //method attached by passport
    req.logout();
    res.redirect('/');
  });

  app.get('/api/current_user', (req, res) => {
    //anyone going through the Oauth flow will be attached as req.user by passport
    res.send(req.user);
  });
};
