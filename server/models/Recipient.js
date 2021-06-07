const mongoose = require('mongoose');
const { Schema } = mongoose;

//sub-document
const recipientSchema = new Schema({
  email: String,
  responded: { type: Boolean, default: false },
});

//export
//import into Survey.js - we don't have to require in in index.js anymore
module.exports = recipientSchema;
