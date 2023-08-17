const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const Supervisor = require('../../models/Supervisor/Supervisor');
const User = require('../../models/Student/User');
const authenticateUser = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const JWT_KEY = 'hamzakhan1'; // Replace with your actual JWT secret key
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const Group = require('../../models/GROUP/Group')
const ProjectRequest = require('../../models/ProjectRequest/ProjectRequest')

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
  body('name', 'Name is required').exists(),
  body('designation', 'Designation is required').exists(),
  body('password', 'Password is required').exists(),
], async (req, res) => {
  const {name, designation, username, password, slots } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const supervisor = new Supervisor({name, designation, username, password, slots });
    await supervisor.save();
    res.json({ success: true, supervisor });
  } catch (err) {
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

    const deletedMember = await Supervisor.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    res.json({ message: 'Supervisor deleted successfully' });
  } catch (error) {
    console.error('Error deleting Supervisor:', error);
    res.status(500).json({ message: 'Error deleting Supervisor', error });
  }
});

  //get all Supervisor
  router.get('/get-supervisors', async (req,res)=>{

    try {
      const members = await Supervisor.find();
      res.json({success:true, members})
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }

  });

router.use(authenticateUser);
// Add student to a supervisor's group using rollNo
router.post('/add-student', async (req, res) => {
  const { username, projectTitle, description, scope } = req.body;

  try {
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const student = await User.findOne({ username });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.supervisor) {
      return res.status(400).json({ success: false, message: 'Student is already associated with a supervisor' });
    }

    // Check if supervisor has available slots
    if (supervisor.slots <= 0) {
      return res.status(400).json({ success: false, message: 'Supervisor has no available slots' });
    }

    // Create a new group or find an existing group with available slots
    let group = await Group.findOne({ $and: [{ supervisor: supervisorId }, { $expr: { $lt: ["$students", 2] } }] });
    if (!group) {
      group = new Group({ supervisor: supervisorId });
      supervisor.slots--; // Decrease the available slots
      await supervisor.save();
    }

    group.students.push(student._id);
    await group.save();

    student.supervisor = supervisorId;
    student.projectTitle = projectTitle;
    student.projectDescription = description;
    student.projectScope = scope;
    await student.save();

    res.json({ success: true, supervisor, student, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Get supervisor's group users
router.get('/my-group-users', async (req, res) => {
  const supervisorId = req.user.id;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const groupUsers = await User.find({ supervisor: supervisorId });

    // Construct the response format you described earlier
    const groupData = groupUsers.map(user => ({
      supervior: supervisor.name,
      Project: [
        {
          projectTitle: user.projectTitle,
          students: [
            { fname: user.name, lname: user.father, rollNo: user.rollNo }
          ]
        }
      ]
    }));

    res.json(groupData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Route to get project requests sent to the supervisor
router.get('/my-project-requests', async (req, res) => {
  try {
    const supervisorId = req.user.id; // Get the supervisor's ID from the authenticated user
    const projectRequests = await ProjectRequest.find({ supervisor: supervisorId }).populate('student');

    res.json({ success: true, projectRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Accept project request
router.post('/accept-project-request', async (req, res) => {
  const supervisorId = req.user.id;
  const { requestId } = req.body;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = await ProjectRequest.findById(requestId);
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    // Check if the project request is for this supervisor
    if (!projectRequest.supervisor.equals(supervisor._id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request' });
    }

    // Update student's supervisor and group if the request is accepted
    if (projectRequest.status === 'pending') {
      const student = await User.findById(projectRequest.student);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      // Associate the supervisor to the student
      student.supervisor = supervisorId;
      await student.save();

      // Update the project request status to accepted
      projectRequest.status = 'accepted';
      await projectRequest.save();

      return res.json({ success: true, message: 'Project request accepted' });
    } else {
      return res.status(400).json({ success: false, message: 'Project request has already been processed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject project request
router.post('/reject-project-request', async (req, res) => {
  const supervisorId = req.user.id;
  const { requestId } = req.body;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = await ProjectRequest.findById(requestId);
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    // Check if the project request is for this supervisor
    if (!projectRequest.supervisor.equals(supervisor._id)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to reject this request' });
    }

    // Update the project request status to rejected
    projectRequest.status = 'rejected';
    await projectRequest.save();

    return res.json({ success: true, message: 'Project request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
