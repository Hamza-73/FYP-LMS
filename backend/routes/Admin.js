const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
JWT_KEY = 'hamzakhan1'
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin'); // Import the Admin model
const Committee = require('../models/Committee'); // Import the Admin model
const authenticateUser = require('../middleware/auth')

// Registration route for admins
router.post('/register', [
    body('username', 'Enter a valid username').isLength({ min: 3 }),
    body('fname', 'Enter a valid fname').isLength({ min: 3 }),
    body('lname', 'Enter a valid lname').isLength({ min: 4 }),
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password must be at least 4 characters').isLength({ min: 4 }),
], async (req, res) => {
    const { fname, lname ,username, email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the username or email already exists in the database
        const existingUser = await Admin.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Username or email already exists' });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new admin if the username and email are unique
            const newAdmin = new Admin({ fname, lname, username, email, password: hashedPassword });
            await newAdmin.save();

            const data = {
                user: { id: newAdmin.id },
            };
            const token = jwt.sign(data, JWT_KEY);

            res.json({ success: true, token, message: 'Admin registration successful' });
        }
    } catch (err) {
        console.error('Error in admin registration', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Login route for admins
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the admin by username
        const admin = await Admin.findOne({ username });

        // Check if the user is an admin or a committee member with an "admin" role
        if (admin) {
            // If the user is an admin
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (isPasswordValid) {
                // Generate JWT token for admin
                const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_KEY);

                res.json({ message: 'Admin login successful', success: true, token });
            } else {
                res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
        } else {
            // If the user is not an admin, check if they are a committee member with an "admin" role
            const committeeAdmin = await Committee.findOne({ username, isAdmin: true });

            if (committeeAdmin) {
                const isPasswordValid = await bcrypt.compare(password, committeeAdmin.password);

                if (isPasswordValid) {
                    // Generate JWT token for committee member acting as an admin
                    const token = jwt.sign({ id: committeeAdmin.id, role: 'admin' }, JWT_KEY);

                    res.json({ message: 'Admin login successful', success: true, token });
                } else {
                    res.status(401).json({ success: false, message: 'Invalid username or password' });
                }
            } else {
                res.status(404).json({ success: false, message: "Admin or committee member not found" });
            }
        }
    } catch (err) {
        console.error('Error in admin login', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route to make a committee member an admin
router.post('/make-admin', async (req, res) => {
    const { username } = req.body;

    try {
        // Find the committee member by username
        const committeeMember = await Committee.findOne({ username });

        if (!committeeMember) {
            return res.status(404).json({ success: false, message: "Committee member not found" });
        }
        if(committeeMember.isAdmin){
            return res.status(201).json({success:true , message:"Committee Member is Already Admin"});
        }

        // Update the committee member's role to "admin"
        committeeMember.isAdmin = true;
        await committeeMember.save();

        res.json({ message: 'Committee member is now an admin', success: true });
    } catch (err) {
        console.error('Error making committee member an admin', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// get detail of admin
router.get('/detail', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id; // Get the authenticated user's ID from the token payload

        // Check if the user is an admin
        const admin = await Admin.findById(userId);

        if (admin) {
            console.log('admin is ')
            let member = admin;
            // User is an admin, return admin details
            return res.json({ success: true, member });
        }

        // User is not an admin, check if they are a committee member
        const committeeMember = await Committee.findById(userId);

        if (committeeMember) {
            let member = committeeMember;
            // User is a committee member, return committee member details
            return res.json({ success: true, member });
        }

        // User not found
        return res.status(404).json({ message: 'Admin not found' });
    } catch (error) {
        console.error('Error in detail route:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Route to delete an admin by ID
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const admin = await Admin.findByIdAndDelete(id);
        if(!admin){
            const committee = await Committee.findById(id);
            if(committee){
                committee.isAdmin = false ;
                await committee.save();
                return res.json({success:true, message:"Admin Deleted Successfully"});
            }else{
                return res.json({ success:false, message:"Admin Not Found"})
            }
        }
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        console.error('error is ', error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to edit an admin by ID
router.put('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedDetail = req.body;

    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            id, updatedDetail, { new: true }
        );
        if(!updatedAdmin){
            const committeeMember = await Committee.findByIdAndUpdate(
                 id , updatedDetail , { new : true }
            );
            if(committeeMember){
                await committeeMember.save();
                console.log('comiitte edited')
                return res.json({ success: true, message : "Edited Sucessfully"});
            }else{
                return res.status(404).json({ message: 'Admin Not Found' });
            }
        }
        await updatedAdmin.save();
        return res.json({ success: true, message : "Edited Sucessfully"});
    } catch (error) {
        console.error('error is ', error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to get a list of all admins and committee members
router.get('/get-members', async (req, res) => {
    try {
        const allAdmins = await Admin.find();
        const committeeMembers = await Committee.find({ isAdmin: true  });

        // Merge admin and committee members into the members array
        const members = [...allAdmins, ...committeeMembers];

        if (members.length === 0) {
            res.status(404).json({ message: 'Members Not Found' });
        } else {
            res.json({
                success: true,
                members
            });
        }
    } catch (error) {
        console.error('error is ', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;  