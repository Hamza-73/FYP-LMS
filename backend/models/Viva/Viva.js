const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vivaSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true }, // Reference to the Group model
  projectTitle: { type: String, required: true },
  supervisor: { type: Schema.Types.ObjectId, ref: 'Supervisor', required: true }, // Reference to the Supervisor model
  students: [{
    studentId : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name : {type: String},
    rollNO : {type : String}
  }], // Reference to the User model for student names
  documentation: { type: String },
  vivaDate: { type: Date, required: true }
});

vivaSchema.methods.populateDocumentation = async function() {
    const group = await this.model('Group').findById(this.group);
    this.documentation = group.remarks;
  };
  
module.exports = mongoose.model('Viva', vivaSchema);