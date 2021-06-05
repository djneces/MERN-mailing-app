const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
  //adding requireLogin middleware
  app.post('/api/stripe', requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: 'usd',
      description: '$5 for 5 credits',
      //id token
      source: req.body.id,
    });

    //setup automatically by passport
    req.user.credits += 5;
    //save the model in the DB, we use user as the most updated (after saving into DB)
    const user = await req.user.save();
    res.send(user);
  });
};
