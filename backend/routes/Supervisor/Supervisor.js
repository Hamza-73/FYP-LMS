const express = require('express');
const router = express.Router();
const Supervisor = require('../../models/Supervisor/Supervisor');
const User = require('../../models/Student/User');
const authenticateUser = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const JWT_KEY = 'hamzakhan1'; // Replace with your actual JWT secret key
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username });

    // Check if supervisor exists and if the password matches
    if (supervisor && bcrypt.compare(password, supervisor.password)) {
      // Generate JWT token
      const token = jwt.sign({ id: supervisor._id }, JWT_KEY);

      res.json({ message: 'Supervisor Login successful', success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid name or password' });
    }
  } catch (err) {
    console.log('error'+err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new supervisor
router.post('/create', [
  body('fname', 'First Name is required').exists(),
  body('lname', 'Last Name is required').exists(),
  body('designation', 'Designation is required').exists(),
  body('password', 'Password is required').exists(),
], async (req, res) => {
  const { fname, lname, designation, username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const supervisor = new Supervisor({ fname, lname, designation, username, password });
    await supervisor.save();
    res.json({ success: true, supervisor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



router.use(authenticateUser);
// Add student to a supervisor's group using rollNo
router.post('/add-student', async (req, res) => {
  const { username } = req.body;

  try {
    const supervisorId = req.user.id; // Get the supervisor's ID from the authenticated user
    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Find the student by rollNo
    const student = await User.findOne({ username });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if the student is already associated with a supervisor
    if (student.supervisor) {
      return res.status(400).json({ success: false, message: 'Student is already associated with a supervisor' });
    }

    supervisor.users.push(student._id);
    await supervisor.save();

    // Associate the supervisor to the student
    student.supervisor = supervisorId;
    await student.save();

    res.json({ success: true, supervisor, student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add a route to get supervisor's group users
router.get('/my-group-users', async (req, res) => {
  const supervisorId = req.user.id;

  try {
    const supervisor = await Supervisor.findById(supervisorId).populate('users');
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const groupUsers = supervisor.users;
    res.json({ success: true, groupUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Accept project request
router.post('/accept-project-request', async (req, res) => {
  const supervisorId = req.user.id;
  const { userId, projectId } = req.body;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the supervisor is associated with the user
    if (!supervisor.users.includes(user.id)) {
      return res.status(400).json({ success: false, message: 'User is not in your group' });
    }

    // Check if the project request is in the user's pending requests
    if (!user.pendingRequests.includes(projectId)) {
      return res.status(400).json({ success: false, message: 'Project request not found' });
    }

    // Remove the project request from pending requests and update the project's user
    user.pendingRequests.pull(projectId);
    await user.save();

    const project = await Project.findById(projectId);
    if (project) {
      project.student = userId;
      await project.save();
    }

    res.json({ success: true, message: 'Project request accepted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject project request
router.post('/reject-project-request', async (req, res) => {
  const supervisorId = req.user.id;
  const { userId, projectId } = req.body;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the supervisor is associated with the user
    if (!supervisor.users.includes(user.id)) {
      return res.status(400).json({ success: false, message: 'User is not in your group' });
    }

    // Check if the project request is in the user's pending requests
    if (!user.pendingRequests.includes(projectId)) {
      return res.status(400).json({ success: false, message: 'Project request not found' });
    }

    // Remove the project request from pending requests
    user.pendingRequests.pull(projectId);
    await user.save();

    res.json({ success: true, message: 'Project request rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
