// supervisor.js (routes/Supervisor.js)
const express = require('express');
const router = express.Router();
const Supervisor = require('../../models/Supervisor');
const User = require('../../models/Student/User');
const authenticateUser = require('../../middleware/auth');

router.use(authenticateUser);

// Create a new supervisor
router.post('/create', async (req, res) => {
  const { fname, lname, designation } = req.body;

  try {
    const supervisor = new Supervisor({ fname, lname, designation });
    await supervisor.save();
    res.json({ success: true, supervisor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add student to a supervisor's group using rollNo
router.post('/add-student', async (req, res) => {
    const { supervisorId, rollNo } = req.body;
  
    try {
      const supervisor = await Supervisor.findById(supervisorId);
      if (!supervisor) {
        return res.status(404).json({ success: false, message: 'Supervisor not found' });
      }
  
      // Find the student by rollNo
      const student = await User.findOne({ rollNo });
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
  
      res.json({ success: true, supervisor });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  // Register a new supervisor
router.post('/register', async (req, res) => {
    const { name, department, username, password } = req.body;
  
    try {
      // Check if a supervisor with the provided username already exists
      const existingSupervisor = await User.findOne({ username });
      if (existingSupervisor) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
  
      // Create a new supervisor and save it to the database
      const supervisor = new User({ name, department, username, password });
      await supervisor.save();
  
      res.json({ success: true, supervisor });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

module.exports = router;
