const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    fname: { type: String },
    lname: { type: String },
    username: { type: String, required: true, unique: true, minlength: 4 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 4 },
});

module.exports = mongoose.model('Admin', adminSchema);