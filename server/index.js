const express = require('express');
const mongoose = require('mongoose');
//tell express to enable cookies
const cookieSession = require('cookie-session');
//tell passport to check the auth state via cookies
const passport = require('passport');
const keys = require('./config/keys');
//we need to define User before passport
require('./models/User');
require('./models/Survey');
//we just need to require the file, there is no export in passport.js
require('./services/passport');

mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

//middleware instead of body parser
app.use(express.json());

//app.use - middleware before route handlers
//cookie.session contains _id (user Id in the DB), that passes over to passport
app.use(
  cookieSession({
    //30days
    maxAge: 30 * 24 * 60 * 60 * 1000,
    //encrypt the id token
    keys: [keys.cookieKey],
  })
);
//tell passport to use cookies
app.use(passport.initialize());
app.use(passport.session());

//we don't need to use extra var (const authRoutes = require('./routes/authRoutes'), and then here authRoutes(app))
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

//prod environment (Heroku)
if (process.env.NODE_ENV === 'production') {
  //Express will serve up production assets (main.js or main.css)
  app.use(express.static('client/build'));
  //Express will serve up the index.html if it doesn't recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
