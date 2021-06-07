const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates.js/surveyTemplate');

//we don't export Survey.js and require here => avoid bugs while testing, we bring it up here with 1 argument
//mongoose model class -> to create an instance of a survey
const Survey = mongoose.model('surveys');

module.exports = (app) => {
  //response once user votes
  app.get('/api/surveys/thanks/', (req, res) => {
    res.send('Thanks for voting!');
  });

  //user needs to be logged in and have enough credits
  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      //converts arr of strings -> array of objects
      recipients: recipients
        .split(',')
        .map((email) => ({ email: email.trim() })),
      //mongo id
      _user: req.user.id,
      dateSent: Date.now(),
    });

    //send an email
    //survey is {subject, recipients}
    //template uses body from the survey
    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      await mailer.send();

      // save survey in the DB
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      //user with new value of credits
      res.send(user);
    } catch (err) {
      //un-processable entity 422
      res.status(422).send(err);
    }
  });
};
