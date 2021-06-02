const mongoose = require('mongoose');
// const Schema = mongoose.Schema
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: String,
});

//users - name of the collection
//load the schema into mongoose
mongoose.model('users', userSchema);
