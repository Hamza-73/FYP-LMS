const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  name: { type: String, required: true },
  username:{type: String, required: true},
  designation:{type: String, required: true},
  department:{type: String, required: true},
  slots:{type: Number, required: true},
  password:{type: String, required: true},
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }], // Store group IDs here
  projectRequest: [
    {
      isAccepted: {type : Boolean, default : false},
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest' },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  seenNotifications: { type: Array, default: [] },
  unseenNotifications: { type: Array, default: [] },
  myIdeas : [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest'}]
});

module.exports = mongoose.model('Supervisor', supervisorSchema);