const express = require('express');
const mongoose = require('mongoose');
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
const moment = require('moment');

const multer = require('multer');
const Viva = require('../../models/Viva/Viva');
const uuid = require('uuid');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {  
    cb(null, 'uploads/')   
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, file.originalname)
  }
})

const upload = multer({ storage });
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dfexs9qho', 
  api_key: '798692241663155', 
  api_secret: '_zRYx_DFqV6FXNK664jRFxbKRP8' 
});


router.post('/upload', authenticateUser,  async (req, res) => {
  try {
    const { type } = req.body;
    // Check if the user belongs to the specified group
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Student Not Found' });
    }

    const groupUpdate =  await Group.findById(user.group);
    if (!groupUpdate) {
      return res.status(404).json({ success:false, message: 'Group Not Found' });
    }

    const file = req.files[type];
    console.log('file is ', file);

    cloudinary.uploader.upload(file.tempFilePath, async (error, result)=>{
      console.log('result is ', result);
      
      const promises = groupUpdate.projects.map(async project => {
        return Promise.all(project.students.map(async student => {
          const studentObj = await User.findById(student.userId);
          if (!studentObj) {
            return res.status(404).json({ success:false, message: 'Student Not Found' });
          }
          
          studentObj.unseenNotifications.push({
            type: "Important",
            message: `${type[0].toUpperCase() + type.slice(1,type.length)} For Your Group is Uploaded`
          });

          if (type === 'proposal') {
            studentObj.isProp = true;
            groupUpdate.isProp = true;
            groupUpdate.proposal = result.url;
            groupUpdate.propSub =  moment(new Date(), 'DD-MM-YYYY').toDate();
          } else if (type === 'documentation') {
            studentObj.isDoc = true;
            groupUpdate.isDoc = true;
            groupUpdate.documentation = result.url;
            groupUpdate.docSub = moment(new Date(), 'DD-MM-YYYY').toDate();
          } else if(type==='final') {
            studentObj.isFinal = true;
            groupUpdate.isFinal = true;
            groupUpdate.finalSubmission = result.url;
            groupUpdate.finalSub = moment(new Date(), 'DD-MM-YYYY').toDate();
          }else{
            return res.status(404).json({success:false, message:"The Type Is Not Correct"})
          }
        }));
      });

      await Promise.all(promises);

      // Save groupUpdate and user objects after all updates are done
      await Promise.all([...promises, groupUpdate.save()]);
    });

    res.status(201).json({ success:true,  message: 'PDF uploaded successfully' });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ success:false,  message: 'Internal server error' });
  }
});




// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const check = await bcrypt.compare(password, user.password)

    // Check if supervisor exists and if the password matches
    if (check) {
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
      return res.status(409).json({ success: false, message: 'username already exists' });
    } else {

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      // Create a new user if the username is unique
      const newUser = new User({ name, father, username, rollNo, batch, cnic, semester, department, password: secPass });
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
    const student = await User.findById(id);
    if(!student){
      return res.status(404).json({ message: 'Student not found' });
    }
    const group = await Group.findById(student.group);
    if(!group){
      return;
    }
    // It will delete student data from all the groups and projectRequests 
    group.projects.map(async project=>{
      const filteredGroup = project.students.filter(stu=>{
        return !stu.userId.equals(student._id)
      });
      project.students = filteredGroup;
      const projectRequest = await ProjectRequest.findOne({projectTitle: project.projectTitle});
      if(!projectRequest){
        return;
      }
      const FilteredRequest = projectRequest.students.filter(stu=>{
        return !stu.equals(student._id);
      })
      projectRequest.students = FilteredRequest;
      projectRequest.status = false ;
      await Promise.all([ group.save(), projectRequest.save() ])
      
    });

    // Notify supervisor that his studet is deleted
    const supervisor = await Supervisor.findById(group.supervisorId);
    if(!supervisor){
      return;
    }
    supervisor.unseenNotifications.push({ type : "Important", message:`Committee deleted your group student ${student.name}`});
    await supervisor.save();
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
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(newPassword, salt);
    user.password = secPass;
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
      return res.status(500).json({ success: false, message: 'You are already in a group' });
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
        student: user._id,
        projectTitle, description,
        scope, status: false
      });
      user.pendingRequests.push({
        projectId: projectRequest._id,
        supervisor: supervisor._id
      });
      user.unseenNotifications.push({ type: "Important", message: `Project request sent to ${supervisor.name}` });

      // console.log('project id is ', projectRequest._id, 'type is ', typeof (projectRequest._id))
      // console.log('user id is ', user._id, 'type is ', typeof (user._id))

      supervisor.projectRequest.push({
        isAccepted: false,
        project: projectRequest._id,
        user: user._id
      })
      supervisor.unseenNotifications.push({ type: "Important", message: `A new proposal for ${projectTitle}` });

      await Promise.all([user.save(), supervisor.save(), projectRequest.save()]);

      return res.json({ success: true, message: `Project request sent to ${supervisor.name}` });

    }

    // Check if the user has already sent a request to this supervisor
    const requestExists = user.pendingRequests.map(req => {
      console.log(req.projectId.equals(pendingProject._id) && req.supervisor.equals(supervisor._id))
      return (req.projectId.equals(pendingProject._id) && req.supervisor.equals(supervisor._id))

    })
    // console.log('requestExists ', requestExists)

    if (requestExists) {
      return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
    }

    user.pendingRequests.push({
      projectId: pendingProject._id,
      supervisor: supervisor._id
    })
    supervisor.projectRequest.push({
      isAccepted: false,
      project: pendingProject._id,
      user: user._id
    })
    supervisor.unseenNotifications.push({ type: "Important", message: `A new proposal for ${projectTitle}` });

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

router.post('/request-to-join/:projectTitle', authenticateUser, async (req, res) => {
  const { projectTitle } = req.params;

  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.isMember) {
      return res.status(500).json({ success: false, message: `You're already in a Group` });
    }

    const projectRequest = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    // Check if the group is already filled
    if (projectRequest.students.length === 2) {
      return res.status(400).json({ success: false, message: 'Student The Group is already filled' });
    }
    console.log('project request in sending request is ', projectRequest.supervisor)
    const supervisor = await Supervisor.findById(projectRequest.supervisor);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Check if a user has already sent a request for this group
    const hasSentRequest = student.pendingRequests.some((request) =>
      request.projectId.equals(projectRequest._id) && request.supervisor.equals(supervisor._id)
    );

    if (hasSentRequest) {
      return res.status(500).json({ success: false, message: `You've Already sent Request for This Group` });
    }

    const notificationMessage = `${student.name} has requested to join the group: ${projectRequest.projectTitle}`;
    supervisor.unseenNotifications.push({ type: 'Important', message: notificationMessage });
    supervisor.projectRequest.push({
      project: projectRequest._id,
      user: student._id
    });
    student.pendingRequests.push({
      projectId: projectRequest._id,
      supervisor: supervisor._id
    });
    student.unseenNotifications.push({ type: 'Important', message: `You've sent a request to ${supervisor.name} to join group ${projectRequest.projectTitle}` })
    await Promise.all([supervisor.save(), student.save()]);

    res.json({ success: true, message: `Request sent to ${supervisor.name} for ${projectRequest.projectTitle}` });
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
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/my-group', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('userId', userId)
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Student Not Found' });
    }
    const group = await Group.findById(student.group);
    if (!group) {
      return res.status(404).json({ message: 'Group Not Found' });
    }
    const viva = await Viva.findById(student.viva);
    const groupDetail = {
      myDetail: [{
        name: student.name,
        rollNo: student.rollNo,
        myId: student._id
      }],
      groupId: student.group, supervisor: group.supervisor,
      supervisorId: group.supervisorId, projectTitle: group.projects[0].projectTitle,
      projectId: group.projects[0].projectId,
      groupMember: group.projects[0].students.filter(stu => !stu.userId.equals(userId)),
      proposal: group.proposal, documentation: group.documentation, finalSubmission : group.finalSubmission,
      docDate: student.docDate ? student.docDate : '----',
      propDate: student.propDate ? student.propDate : '----',
      viva: viva ? viva.vivaDate : '-----'
    }
    return res.json({ success: true, group: groupDetail })
  } catch (error) {

  }
});

router.get('/notification', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const notification = user.unseenNotifications;
    return res.json({ success: true, notification })
  } catch (error) {
    console.error('error is ', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;