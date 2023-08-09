// user.js (models/Student/User.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  token: { type: String },
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to the Supervisor model
});

module.exports = mongoose.model('User', userSchema);
