// ProjectRequest.js (models/ProjectRequest.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectRequestSchema = new Schema({
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectTitle: { type: String, required: true },
  description: { type: String, required: true },
  scope: { type: String, required: true },
});

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);
