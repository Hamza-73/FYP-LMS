const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  supervisor: { type: String, required: true },
  supervisorId: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
  projects: [{
    projectTitle: { type: String, required: true, unique: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'ProjectRequest' },
    students: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      rollNo: { type: String, required: true },
    }]
  }],
  remarks: { type: String },
  marks: { type: Number },
  external: { type: Number },
  proposal: { type: String },
  finalSubmission: { type: String },
  documentation: { type: String },
  isProp: { type: Boolean, default: false },
  isDoc: { type: Boolean, default: false },
  viva: { type: Schema.Types.ObjectId, ref: 'Viva' },
  vivaDate: { type: String },
  propDate: { type: Date },
  propSub: { type: Date },
  docDate: { type: Date },
  docSub: { type: Date },
  meetingid: { type: Schema.Types.ObjectId, ref: 'Meeting' },
  meetingLink: { type: String },
  meetingDate: { type: Date },
  isFinal: { type: Boolean, default: false },
  finalDate: { type: Date },
  finalSub: { type: Date },
  meetingReport: [{
  id :{ type: Schema.Types.ObjectId, ref: 'Meeting' },
  date: {type : Date},
  review : {type : Number}
}],
  docs: [{
    docLink: { type: String },
    review: { type: String }
  }],
  instructions : {type: String}
});

module.exports = mongoose.model('Group', groupSchema);