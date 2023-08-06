const express = require('express');
const router = express.Router();
const User = require('../../models/Student/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_KEY = 'hamzakhan1'

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find the user by username
      const user = await User.findOne({ username });
  
      // Check if user exists and if the password matches
      if (user && bcrypt.compare(password, user.password)) {
        // Generate JWT token
        const token = jwt.sign({ id: user.id }, JWT_KEY);
  
        // Save the token to the user's token field in the database
        user.token = token;
        await user.save();
  
        // Send the token in the response
        res.json({ message: 'Login successful', success: true, token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
});  
    

// Registration route
router.post('/register', [
    body('name','Name should be atleast 4 characters').isLength({min:4}),
    body('username', 'Enter a valid username').isLength({min:4}),
    body('password', 'Password must be atleast 4 characters').isLength({ min: 4 }),
    body('rollNo', 'Roll Number cannot not be blank').exists(),
    body('department', 'Department cannot be left blank').exists(),
], async (req, res) => {
    const { name, username, rollNo, department, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            res.status(409).json({ success: false, message: 'username already exists' });
        } else {
            // Create a new user if the username is unique
            const newUser = new User({ name, username, rollNo, department, password });
            await newUser.save();
            const data = {
                user: {
                  id: newUser.id
                }
              }
              const token = jwt.sign(data, JWT_KEY)
            res.json({ success: true, token, message: 'Registration successful' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// Password reset route
router.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;
  
    try {
      // Find the user by username
      const user = await User.findOne({ username });
  
      // Check if user exists
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Update the password and save it to the database
      user.password = newPassword;
      await user.save();
      res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  module.exports = router;