const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const committeeSchema = new Schema({
  fname: { type: String, required: true, minlength: 3 },
  lname: { type: String, required: true, minlength: 3 },
  email: { type: String, unique: true },
  username: { type: String, required: true, unique: true, minlength: 4 },
  department: { type: String, required: true, validate: /^[a-zA-Z\s]*$/ }, // Only allow alphabetic characters and spaces
  designation: { type: String, required: true },
  password: { type: String, required: true, minlength: 4 },
  isAdmin: { type: Boolean, default: false },
  isLogin: { type: Boolean, default: false },
  requests: [{
    group: { type: String },
    supervisor: { type: String },
    reason: { type: String }
  }],
  vivaHistory: [{
    date: { type: Date },
    type: { type: String },
    time: { type: String }
  }],
  propDate: { type: Date },
  docDate: { type: Date },
});

module.exports = mongoose.model('Committee', committeeSchema);