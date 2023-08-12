const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const committeeSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Committee', committeeSchema);