const sendgrid = require('sendgrid');
const helper = sendgrid.mail;
const keys = require('../config/keys');

//additional customization to Mail class
class Mailer extends helper.Mail {
  //arguments survey, template from surveyRoutes.js
  constructor({ subject, recipients }, content) {
    //sendgrid docs:
    super();

    this.sgApi = sendgrid(keys.sendGridKey);

    this.from_email = new helper.Email('j.necesanek@hotmail.com');
    this.subject = subject;
    this.body = new helper.Content('text/html', content);
    this.recipients = this.formatAddresses(recipients);

    //build in func
    this.addContent(this.body);
    //enable click tracking in the email (sendgrid scans & replaces links with their reference)
    this.addClickTracking();

    this.addRecipients();
  }

  //recipients comes form survey as [{},{}]
  // => list of helper email objects in [], later we need to add them to the mailer (addRecipients)
  formatAddresses(recipients) {
    return recipients.map(({ email }) => {
      //format the email as per sendgrid
      return new helper.Email(email);
    });
  }

  addClickTracking() {
    const trackingSettings = new helper.TrackingSettings();
    const clickTracking = new helper.ClickTracking(true, true);

    trackingSettings.setClickTracking(clickTracking);
    this.addTrackingSettings(trackingSettings);
  }

  addRecipients() {
    const personalize = new helper.Personalization();
    this.recipients.forEach((recipient) => {
      personalize.addTo(recipient);
    });
    this.addPersonalization(personalize);
  }

  //send over to sendgrid
  async send() {
    const request = this.sgApi.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: this.toJSON(),
    });

    const response = await this.sgApi.API(request);
    return response;
  }
}

module.exports = Mailer;
