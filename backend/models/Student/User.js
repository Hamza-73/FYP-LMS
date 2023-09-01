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
  marks : {type : Number, },
  external : {type : Number, },
  isMember : {type : Boolean, default:false},
  isDoc : {type:Boolean, default:false},
  isProp : {type:Boolean, default:false},
  propDate:{type : Date},
  docDate : {type: Date},
  viva : {type: Schema.Types.ObjectId, ref: 'Viva'}
});

module.exports = mongoose.model('User', userSchema);
