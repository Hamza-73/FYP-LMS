const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  name: { type: String, required: true },
  username:{type: String, required: true, unique:true},
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
  myIdeas : [{
    projectId : { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest'},
    date : {type : Date},
    time : {type : String} 
  }],
  meetingId: { type: Schema.Types.ObjectId, ref: 'Meeting' },
  meetingLink: { type: String },
  meetingTime : {
    type: String,
    match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, // Validate as HH:mm format
  },
  meetingDate : {type : Date},
  meetingGroup:{type: String}
});

module.exports = mongoose.model('Supervisor', supervisorSchema);