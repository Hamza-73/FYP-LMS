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
const ProjectRequest = require('../../models/ProjectRequest/ProjectRequest');
const Group = require('../../models/GROUP/Group');

const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// to upload file
router.post('/proposal', upload.single('proposal'), authenticateUser, async (req, res) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const id = user.group;
    const group = await Group.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          proposal: {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          },
        },
      },
      { new: true } // To get the updated group after the update
    );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    await group.save();
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
    // Find the user who is making the request
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // check if user is already in a group 
    if (user.isMember) {
      user.pendingRequests = [];
      await user.save()
      return res.status(404).json({ success: false, message: 'You are already in a group' });
    }

    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username: username });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }


    console.log('Supervisor is ', supervisor)

    console.log('User is ', user)
    // Check if project exists
    const pendingProject = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!pendingProject) {
      // Create a new project request and add it to the user's pendingRequests
      const projectRequest = new ProjectRequest({
        supervisor: supervisor._id,
        student: user._id,
        projectTitle, description,
        scope, status: false
      });
      user.pendingRequests.push({
        projectId: projectRequest._id,
        supervisor: supervisor._id
      });
      user.unseenNotifications.push({ message: `Project request sent to ${supervisor.name}` });

      // console.log('project id is ', projectRequest._id, 'type is ', typeof (projectRequest._id))
      // console.log('user id is ', user._id, 'type is ', typeof (user._id))

      supervisor.projectRequest.push({
        isAccepted: false,
        project: projectRequest._id,
        user: user._id
      })
      supervisor.unseenNotifications.push({ message: `A new proposal for ${projectTitle}` });

      await Promise.all([user.save(), supervisor.save(), projectRequest.save()]);

      res.json({ success: true, message: `Project request sent to ${supervisor.name}` });

    }

    // console.log('pending request is ', pendingProject)
    // console.log('id request is ', pendingProject._id)
    // Check if the user has already sent a request to this supervisor
    const requestExists = user.pendingRequests.map(req => {
      // console.log('req is ', req);
      // console.log('re proj is', req.projectId);
      // console.log('proje id', pendingProject._id);
      // console.log('req sup is', req.supervisor);
      // console.log('supervisor id', supervisor._id);
      console.log(req.projectId.equals(pendingProject._id) && req.supervisor.equals(supervisor._id) )
        return (req.projectId.equals(pendingProject._id) && req.supervisor.equals(supervisor._id) )
        
      })
    console.log('requestExists ', requestExists)

    if (requestExists) {
      return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
    }

    user.pendingRequests.push({
      projectId :  pendingProject._id ,
      supervisor : supervisor._id
    })
    supervisor.projectRequest.push({
      isAccepted: false,
      project: pendingProject._id,
      user: user._id
    })
    supervisor.unseenNotifications.push({ message: `A new proposal for ${projectTitle}` });

    await Promise.all([user.save(), supervisor.save(), pendingProject.save()]);

    res.json({ success: true, message: `Project request sent to ${supervisor.name}` });
  } catch (err) {
    console.error('Error sending project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


//get my detail
router.get('/detail', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from the token payload

    const member = await User.findById(userId);

    if (!member) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the student details
    return res.json({ success: true, member, user: userId });
  } catch (error) {
    console.error('error is ', error)
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/request-to-join/:projectRequestId', authenticateUser, async (req, res) => {
  const { projectRequestId } = req.params;

  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const projectRequest = await ProjectRequest.findById(projectRequestId);
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    // Check if the student has already requested to join
    if (projectRequest.students.includes(student._id)) {
      return res.status(400).json({ success: false, message: 'Student has already requested to join' });
    }

    projectRequest.students.push(student._id);
    await projectRequest.save();

    const supervisor = await Supervisor.findById(projectRequest.supervisor)

    const notificationMessage = `${student.name} has requested to join the project: ${projectRequest.projectTitle}`;
    supervisor.unseenNotifications.push({ message: notificationMessage });
    await supervisor.save();

    res.json({ success: true, message: 'Request to join sent' });
  } catch (err) {
    console.error('Error sending join request:', err);
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