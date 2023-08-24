const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  supervisor: { type: String, required: true },
  projects: [{
    projectTitle: { type: String, required: true },
    projectId : {type: Schema.Types.ObjectId, ref: 'ProjectRequest'},
    students: [{
      userId : { type: Schema.Types.ObjectId, ref: 'User'},
      name: { type: String, required: true },
      rollNo: { type: String, required: true }
    }]
  }],
  remarks: { type: String },
  marks: { type: Number },
});

module.exports = mongoose.model('Group', groupSchema);
