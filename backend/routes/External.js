const express = require('express');
const mongoose = require('mongoose');
const External = require('../models/External');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const JWT_KEY = 'hamzakhan1';
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");

// Create a new supervisor
router.post('/create', [
    body('name', 'Name is required').exists(),
    body('username', 'username should not be blank').exists(),
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    const { name, username, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingSupervisor = await External.findOne({ username });
        if (existingSupervisor) {
            return res.status(409).json({ success: false, message: 'username already exists' });
        } else {
            const external = new External({ name, username, email });
            await external.save();
            return res.json({ success: true, external });
        }

    } catch (err) {
        console.error('error in creating ', err)
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Route to update external student details
router.put('/edit/:id', async (req, res) => {
    const studentId = req.params.id;
    const updatedDetails = req.body;
    
    try {
        // Check if the updated username or email already exists for another external student
        const existingExternalStudent = await External.findOne({
            $or: [
                { username: updatedDetails.username },
                { email: updatedDetails.email }
            ]
        });

        if (existingExternalStudent && existingExternalStudent._id.toString() !== studentId) {
            return res.status(400).json({ success: false, message: "Username or Email already exists for another external student." });
        }

        // Update external student details
        const updatedExternalStudent = await External.findByIdAndUpdate(studentId, updatedDetails, { new: true });

        if (!updatedExternalStudent) {
            return res.status(404).json({ success: false, message: 'External student not found' });
        }

        res.status(200).json({ success: true, message: "Edited Successfully", updatedStudent: updatedExternalStudent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


//delete supervisor
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Supervisor ID' });
        }

        const deletedMember = await External.findByIdAndDelete(id);

        if (!deletedMember) {
            return res.status(404).json({ message: 'External not found' });
        }

        res.json({ message: 'Supervisor deleted successfully' });
    } catch (error) {
        console.error('Error deleting Supervisor:', error);
        res.status(500).json({ message: 'Error deleting Supervisor', error });
    }
});

//get all Externals
router.get('/get-externals', async (req, res) => {

    try {
        const members = await External.find();
        if (members.length < 0) {
            return res.json({ message: "No external member", success: false });
        }
        res.json({ success: true, members })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

module.exports = router;