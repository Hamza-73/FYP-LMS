// user.js (models/Student/User.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  father: { type: String, required: true },
  username: { type: String, required: true, unique:true },
  rollNo: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  semester: { type: String, required: true },
  cnic: { type: String, required: true, unique:true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  token: { type: String },
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor' }, // Reference to the Supervisor model
  pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  group: { type: Schema.Types.ObjectId, ref: 'Group' }
});

module.exports = mongoose.model('User', userSchema);
