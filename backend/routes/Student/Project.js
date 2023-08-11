// project.js (routes/Project.js)
const express = require('express');
const router = express.Router();
const Project = require('../../models/Student/Project');
const User = require('../../models/Student/User');
const { body, validationResult } = require('express-validator');
const authenticateUser = require('../../middleware/auth'); // Import the authentication middleware

router.use(authenticateUser);

// Project submission route
router.post('/submit', [
  body('title', 'Title is required').exists(),
  body('description', 'Description is required').exists(),
], async (req, res) => {
  const { title, description } = req.body;
  const studentId = req.user.id; 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const project = new Project({
      title,
      description,
      student: studentId,
    });

    await project.save();
    res.json({ success: true, message: 'Project submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get projects for the logged-in student
router.get('/my-projects', async (req, res) => {
  const studentId = req.user.id;

  try {
    const projects = await Project.find({ student: studentId });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send Project Request
router.post('/send-project-request', async (req, res) => {
  const userId = req.user.id;
  const { projectId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is already associated with a supervisor
    if (!user.supervisor) {
      return res.status(400).json({ success: false, message: 'User does not have a supervisor' });
    }

    // Check if the user's supervisor has less than 6 groups and each group has less than 3 students
    const supervisor = await Supervisor.findById(user.supervisor);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    if (supervisor.users.length >= 6) {
      return res.status(400).json({ success: false, message: 'Supervisor already has 6 groups' });
    }

    const groupIndex = supervisor.users.findIndex(id => id.equals(userId));
    if (groupIndex !== -1 && supervisor.users.length[groupIndex].users.length >= 3) {
      return res.status(400).json({ success: false, message: 'Your group already has 3 students' });
    }

    // Add the project request to the user's pending requests
    user.pendingRequests.push(projectId);
    await user.save();

    res.json({ success: true, message: 'Project request sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


module.exports = router;