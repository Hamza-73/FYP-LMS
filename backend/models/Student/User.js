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
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  pendingRequests: [{
    projectId : { type: Schema.Types.ObjectId, ref: 'ProjectRequest' },
    supervisor : { type: Schema.Types.ObjectId, ref: 'Supervisor' }
 } ],
  seenNotifications: { type: Array,  default: [], },
  unseenNotifications: { type: Array, default: [], },
  isMember : {type : Boolean, default:false},
  marks : {type : Number, },
  external : {type : Number, },
});

module.exports = mongoose.model('User', userSchema);
