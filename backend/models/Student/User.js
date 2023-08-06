const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true }, // Add the "name" field
  username: { type: String, required: true }, 
  password: { type: String, required: true },
  department: { type: String, required: true }, // Add the "department" field
  rollNo: { type: String, required: true }, // Add the "department" field
  token: { type: String }
});

module.exports = mongoose.model('User', userSchema);
