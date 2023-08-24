const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const User = require('../../models/Student/User');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_KEY = 'hamzakhan1'
const authenticateUser = require('../../middleware/auth');
const Supervisor = require('../../models/Supervisor/Supervisor');
const ProjectRequest = require('../../models/ProjectRequest/ProjectRequest')

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
  body('name', 'Name should be atleast 4 characters').isLength({ min: 4 }),
  body('father', 'Father Name should be atleast 4 characters').isLength({ min: 4 }),
  body('username', 'Enter a valid username').isLength({ min: 4 }),
  body('password', 'Password must be atleast 4 characters').isLength({ min: 4 }),
  body('rollNo', 'Roll Number cannot not be blank').exists(),
  body('department', 'Department cannot be left blank').exists(),
  body('batch', 'Batch cannot be left blank').exists(),
  body('cnic', 'Cnic cannot be left blank').exists(),
  body('semester', 'Semester cannot be left blank').exists(),
], async (req, res) => {
  const { name, father, username, rollNo, batch, cnic, semester, department, password } = req.body;

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
      const newUser = new User({ name, father, username, rollNo, batch, cnic, semester, department, password });
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


//delete Student
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Student ID' });
    }

    const deletedMember = await User.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting Student:', error);
    res.status(500).json({ message: 'Error deleting Student', error });
  }
});

//get all Supervisor
router.get('/get-students', async (req, res) => {

  try {
    const members = await User.find();
    res.json({ success: true, members })
  } catch (error) {
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

// Get Supervisor
router.get('/my-supervisor', async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('supervisor');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const supervisor = user.supervisor;
    res.json({ success: true, supervisor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// router.use(authenticateUser);

// User sends a project request to a supervisor
router.post('/send-project-request', authenticateUser, async (req, res) => {
  const { username, projectTitle, description, scope } = req.body;

  try {
    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username: username });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    console.log('Supervisor is ', supervisor)

    // Find the user who is making the request
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('User is ', user)
    // Check if the user has already sent a request to this supervisor
    const requestExists = user.pendingRequests.some(request => request.supervisor.equals(supervisor._id));
    if (requestExists) {
      return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
    }

    // Create a new project request and add it to the user's pendingRequests
    const projectRequest = new ProjectRequest({
      supervisor: supervisor._id,
      student: user._id,
      projectTitle,
      description,
      scope,
      status: false
    });

    user.pendingRequests.push(projectRequest);
    user.unseenNotifications.push({ message: `Project request sent to ${supervisor.name}` });

    console.log('project id is ', projectRequest._id, 'type is ', typeof (projectRequest._id))
    console.log('user id is ', user._id, 'type is ', typeof (user._id))
    const request = {
      project: projectRequest._id,
      user: user._id
    };

    supervisor.projectRequest.push(request); // Add the request here

    supervisor.unseenNotifications.push({ message: `A new proposal for ${projectTitle}` });
    
    await Promise.all([user.save(), supervisor.save(), projectRequest.save()]);

    res.json({ success: true, message: 'Project request sent to supervisor' });

  } catch (err) {
    console.error('Error sending project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


//get my detail
router.get('/student', async (req, res) => {
  try {
    const studentId = req.user.id; // Get the authenticated user's ID from the token payload

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the student details
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// User joins a supervisor's group for a specific project idea
router.post('/join-group/:projectId', authenticateUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const projectRequest = await ProjectRequest.findById(projectId);
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    if (projectRequest.students.length >= 2) {
      return res.status(400).json({ success: false, message: 'Group is already filled' });
    }

    // Check if the user has already joined this project's group
    if (projectRequest.students.includes(user._id)) {
      return res.status(400).json({ success: false, message: 'User already in the group' });
    }

    // Add the user to the project's students array
    projectRequest.students.push(user._id);
    await projectRequest.save();

    const notificationMessage = `You have successfully joined the group for the project: ${projectRequest.projectTitle}`;
    user.unseenNotifications.push({ message: notificationMessage });
    await user.save();

    res.json({ success: true, message: 'User joined the group' });

  } catch (err) {
    console.error('Error joining group:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Route to update student details
router.put('/edit/:id', async (req, res) => {
  const studentId = req.params.id;
  const updatedDetails = req.body;

  try {
    const updatedStudent = await User.findByIdAndUpdate(studentId, updatedDetails, { new: true });
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;