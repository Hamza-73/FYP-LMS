// supervisor.js (models/Supervisor.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  fname: { type: String, required: true },
  lname:{type: String, required: true},
  designation:{type: String, required: true},
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Supervisor', supervisorSchema);
