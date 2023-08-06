// project.js (routes/Project.js)
const express = require('express');
const router = express.Router();
const Project = require('../../models/Student/Project');
const { body, validationResult } = require('express-validator');
const authenticateUser = require('../../middleware/auth'); // Import the authentication middleware

router.use(authenticateUser);

// Project submission route
router.post('/submit', [
  body('title', 'Title is required').notEmpty(),
  body('description', 'Description is required').notEmpty(),
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

module.exports = router;