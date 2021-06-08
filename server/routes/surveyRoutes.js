const _ = require('lodash');
const { Path } = require('path-parser');
//default in Node.js
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates.js/surveyTemplate');

//we don't export Survey.js and require here => avoid bugs while testing, we bring it up here with 1 argument
//mongoose model class -> to create an instance of a survey
const Survey = mongoose.model('surveys');

module.exports = (app) => {
  app.get('/api/surveys', requireLogin, async (req, res) => {
    const surveys = await Survey.find({
      _user: req.user.id,
      //not to include recipients in the query - saves a lot of data
    }).select({ recipients: false });

    res.send(surveys);
  });

  //response once user votes
  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.send('Thanks for voting!');
  });

  app.post('/api/surveys/webhooks/', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');
    //filter and modify results from the webhook sendgrid
    _.chain(req.body)
      .map(({ email, url }) => {
        //new URL() -> extract just path name from the url (/api/surveys/1234/yes)
        //p.test() -> get the survey id and the choice (Path needs :), returns {with surveyId and choice as keys} or null
        //matcher
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      //removes all undefined
      .compact()
      //filters unique events, compares email and surveyId
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        //query and update in mongoDB
        Survey.updateOne(
          {
            //find survey with the id and matching email & responded in sub-document collection recipients array
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false },
            },
          },
          {
            //increment by 1
            $inc: { [choice]: 1 },
            //set the responded field of matched recipient in the previous query
            $set: { 'recipients.$.responded': true },
            lastResponded: new Date(),
            //we need to execute
          }
        ).exec();
      })
      .value();

    res.send({});
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
