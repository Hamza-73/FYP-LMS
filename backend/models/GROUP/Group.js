const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  supervisor: { type: String, required: true },
  supervisorId: { type: Schema.Types.ObjectId, ref: 'Supervisor' },
  projects: [{
    projectTitle: { type: String, required: true },
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
  proposal: { data: Buffer, contentType: String },
  isProp: { type: Boolean, default: false },
  isDoc: { type: Boolean, default: false },
  viva: { type: Schema.Types.ObjectId, ref: 'Viva' },
  vivaDate : {type : String},
  propDate: { type: Date },
  docDate: { type: Date },
  meetingid: { type: Schema.Types.ObjectId, ref: 'Meeting' },
  meetingLink: { type: String },
});

module.exports = mongoose.model('Group', groupSchema);