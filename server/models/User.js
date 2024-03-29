const mongoose = require('mongoose');
// const Schema = mongoose.Schema
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
  credits: { type: Number, default: 0 },
});

//users - name of the collection
//load the schema into mongoose
//require it in index.js
mongoose.model('users', userSchema);
