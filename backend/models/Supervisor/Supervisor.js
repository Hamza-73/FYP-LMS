// supervisor.js (models/Supervisor.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  name: { type: String, required: true },
  username:{type: String, required: true},
  designation:{type: String, required: true},
  department:{type: String, required: true},
  slots:{type: String, required: true},
  password:{type: String, required: true},
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Supervisor', supervisorSchema);
