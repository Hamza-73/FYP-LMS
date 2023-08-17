// models/Group.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Group', groupSchema);
