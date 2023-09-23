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

var nodemailer = require('nodemailer');

router.post('/upload', authenticateUser, async (req, res) => {
  try {
    const { type } = req.body;
    // Check if the user belongs to the specified group
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Student Not Found' });
    }

    const groupUpdate = await Group.findById(user.group);
    if (!groupUpdate) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
    }

    console.log('type is ', type);

    if (type === 'documentation' && !groupUpdate.docDate) {
      return res.status(500).json({ success: false, message: 'Deadline for Documentation Has Not Been Announced Yet.' });
    }

    if (type === 'final' && !groupUpdate.finalDate) {
      return res.status(500).json({ success: false, message: 'Deadline for Final Submission Has Not Been Announced Yet.' });
    }

    const file = req.files[type];
    console.log('file is ', file);

    cloudinary.uploader.upload(file.tempFilePath, async (error, result) => {
      console.log('result is ', result);

      const promises = groupUpdate.projects.map(async project => {
        return Promise.all(project.students.map(async student => {
          const studentObj = await User.findById(student.userId);
          if (!studentObj) {
            return res.status(404).json({ success: false, message: 'Student Not Found' });
          }

          studentObj.unseenNotifications.push({
            type: "Important",
            message: `${type[0].toUpperCase() + type.slice(1, type.length)} For Your Group is Uploaded`
          });

          if (type === 'proposal') {
            studentObj.isProp = true;
            groupUpdate.isProp = true;
            groupUpdate.proposal = result.url;
            groupUpdate.propSub = moment(new Date(), 'DD-MM-YYYY').toDate();
          } else if (type === 'documentation') {
            studentObj.isDoc = true;
            groupUpdate.isDoc = true;
            groupUpdate.documentation = result.url;
            groupUpdate.docSub = moment(new Date(), 'DD-MM-YYYY').toDate();
          } else if (type === 'final') {
            studentObj.isFinal = true;
            groupUpdate.isFinal = true;
            groupUpdate.finalSubmission = result.url;
            groupUpdate.finalSub = moment(new Date(), 'DD-MM-YYYY').toDate();
          } else {
            return res.status(404).json({ success: false, message: "The Type Is Not Correct" })
          }
        }));
      });
      await Promise.all(promises);
      // Save groupUpdate and user objects after all updates are done
      await Promise.all([...promises, groupUpdate.save()]);
    });

    res.status(201).json({ success: true, message: 'PDF uploaded successfully' });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/doc', authenticateUser, async (req, res) => {
  try {
    // Check if the user belongs to the specified group
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Student Not Found' });
    }

    const groupUpdate = await Group.findById(user.group);
    if (!groupUpdate) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
    }

    const file = req.files.doc;
    console.log('file is ', file);

    cloudinary.uploader.upload(file.tempFilePath, async (error, result) => {
      console.log('result is ', result);

      groupUpdate.docs.push({
        docLink : result.url, review : ""
      });
      await groupUpdate.save();
    });

    res.status(201).json({ success: true, message: 'PDF uploaded successfully' });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by rollNo : username
    const user = await User.findOne({ rollNo: username });
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
  body('name', 'Name should be at least 4 characters').isLength({ min: 4 }),
  body('father', 'Father Name should be at least 4 characters').isLength({ min: 4 }),
  body('rollNo', 'Invalid Roll Number format').custom((value) => {
    // Define a regular expression pattern for the desired format
    const rollNoPattern = /^[0-9]{4}-BSCS-[0-9]{2}$/;

    // Check if the provided roll number matches the pattern
    if (!rollNoPattern.test(value)) {
      throw new Error('Invalid Roll Number format');
    }

    // If it matches, it's valid, so return true
    return true;
  }),
  body('department', 'Department cannot be left blank').exists(),
  body('batch', 'Batch cannot be left blank').exists(),
  body('cnic', 'CNIC cannot be left blank').exists(),
  body('semester', 'Semester cannot be left blank').exists(),
], async (req, res) => {
  const { name, father, rollNo, batch, cnic, semester, department, email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ rollNo });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(cnic, salt);

      // Create a new user with the formatted roll number
      const newUser = new User({
        name, father, rollNo, batch, cnic, semester, department, password: secPass, email
      });

      await newUser.save();
      const data = {
        user: {
          id: newUser.id
        }
      }
      const token = jwt.sign(data, JWT_KEY);
      res.json({ success: true, token, message: 'Registration successful' });
    }
  } catch (err) {
    console.error('errir in ', err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Password reset route
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ rollNo : username });

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



//delete Student
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;


    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('student is ', student.name);
    // It will delete student data from all the groups and projectRequests 
    const group = await Group.findById(student.group);
    if (group) {
      group.projects.map(async project => {
        const filteredGroup = project.students.filter(stu => {
          return !stu.userId.equals(student._id)
        });
        project.students = filteredGroup;
        const projectRequest = await ProjectRequest.findOne({ projectTitle: project.projectTitle });
        if (!projectRequest) {
          return;
        }
        const FilteredRequest = projectRequest.students.filter(stu => {
          return !stu.equals(student._id);
        })
        projectRequest.students = FilteredRequest;
        projectRequest.status = false;
        await Promise.all([group.save(), projectRequest.save()])

      });
      // Notify supervisor that his studet is deleted
      const supervisor = await Supervisor.findById(group.supervisorId);
      if (!supervisor) {
        return;
      }
      supervisor.unseenNotifications.push({ type: "Important", message: `Committee deleted your group student ${student.name}` });
      await supervisor.save();
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
    const user = await User.findOne({ rollNo: username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
      }
    });

    var mailOptions = {
      from: 'youremail@gmail.com',
      to: 'myfriend@yahoo.com',
      subject: 'Sending Email using Node.js',
      text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
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

    // check if user is already in a group ed
    if (user.isMember) {
      user.pendingRequests = [];
      await user.save()
      return res.status(500).json({ success: false, message: 'You are already in a group' });
    }

    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    if(supervisor.slots<=0){
      return res.status(500).json({ success: false, message: 'Supervisor Slots Are full' });
    }

    // check if supervisor has rejected his request before
    const rejectedRequests = user.rejectedRequest.filter(request => {
      return request.equals(supervisor._id)
    });
    console.log('rejected request is ', rejectedRequests)
    console.log('rejected request is ', rejectedRequests.length)
    if (rejectedRequests.length > 0) {
      return res.status(500).json({ success: false, message: "You cannot send request to this supervisor as he rejected your request before." });
    }

    // Check if the user has already sent a request to this supervisor
    const requestExists = user.pendingRequests.filter(req => {
      return req.equals(supervisor._id)
    });
    console.log('requestExists ', requestExists)
    console.log('requestExists ', requestExists.length)

    if (requestExists.length > 0) {
      return res.status(400).json({ success: false, message: 'Request already sent to this supervisor' });
    }

    const pendingProject = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!pendingProject) {
      // Create a new project request and add it to the user's pendingRequests
      const projectRequest = new ProjectRequest({
        student: user._id,
        projectTitle, description,
        scope, status: false
      });
      user.pendingRequests.push(supervisor._id);
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

    } else {
      return res.status(500).json({ success: false, message: "Request with this project Title Already exist" });
    }

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

    // console.log('project request in sending request is ', projectRequest.supervisor)
    const supervisor = await Supervisor.findById(projectRequest.supervisor);
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // check if supervisor has rejected his request before
    const rejectedRequests = student.rejectedRequest.filter(request => {
      return request.equals(supervisor._id)
    });
    if (rejectedRequests.length > 0) {
      return res.status(500).json({ success: false, message: "You cannot send request to this supervisor as he rejected your request before." });
    }

    // Check if the group is already filled
    if (projectRequest.students.status) {
      return res.status(400).json({ success: false, message: 'Student The Group is already filled' });
    }

    // Check if a user has already sent a request for this group
    const hasSentRequest = student.pendingRequests.filter((request) => {
      request.equals(supervisor._id)
    });

    if (hasSentRequest.length > 0) {
      return res.status(500).json({ success: false, message: `You've Already sent Request To this Supervisor` });
    }

    const notificationMessage = `${student.name} has requested to join the group: ${projectRequest.projectTitle}`;
    supervisor.unseenNotifications.push({ type: 'Important', message: notificationMessage });
    supervisor.projectRequest.push({
      project: projectRequest._id,
      user: student._id
    });
    student.pendingRequests.push(supervisor._id);
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
    const student = await User.findById(studentId);
    if (student) {
      if (student.group) {
        const group = await Group.findById(student.group)
        if (!group) {
          return;
        }
        group.projects.map(proj => {
          proj.students.map(async stu => {
            if (stu.userId.equals(studentId)) {
              stu.name = updatedDetails.name; // Update the name
              stu.rollNo = updatedDetails.rollNo; // Update the rollNo
              await group.save()
            }
          })
        })
      }

    }
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
      return res.status(404).json({ success: false, message: 'Student Not Found' });
    }
    const group = await Group.findById(student.group);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group Not Found' });
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
      proposal: group.proposal, documentation: group.documentation, finalSubmission: group.finalSubmission,
      docDate: group.docDate, propDate: group.propDate,
      finalDate: group.finalDate, docSub: group.docSub,
      propSub: group.propSub, finalSub: group.finalSub,
      viva: viva, meetingReport: group.meetingReport,
      instructions: group.instructions,
      docs: group.docs
    }
    return res.json({ success: true, group: groupDetail })
  } catch (error) {
    console.error(`error fetching group`, error);
    res.json({ message: `Internal Server error ${error}` })
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


// Mark a notification as seen
router.post('/mark-notification-seen/:notificationIndex', authenticateUser, async (req, res) => {
  const userId = req.user.id; // Get the user ID from the authenticated user
  const notificationIndex = req.params; // Assuming you send the notification index in the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the notification index is within the bounds of 'unseenNotifications'
    if (notificationIndex < 0 || notificationIndex >= user.unseenNotifications.length) {
      return res.status(404).json({ message: 'Invalid notification index' });
    }

    // Remove the notification from 'unseenNotifications' and push it to 'seenNotifications'
    const notification = user.unseenNotifications.splice(notificationIndex, 1)[0];
    console.log('notification is ', notification);
    user.seenNotifications.push(notification);

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Notification marked as seen' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getRequests', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requests = [];

    for (const reqId of user.requests) {
      const request = await ProjectRequest.findById(reqId);

      if (!request) {
        continue; // Skip requests that couldn't be found
      }

      const supervisor = await Supervisor.findById(request.supervisor);
      if (!supervisor) {
        continue; // Skip requests with supervisors that couldn't be found
      }
      requests.push({
        projectId: request._id,
        projectTitle: request.projectTitle,
        description: request.description,
        scope: request.scope,
        supervisorName: supervisor.name,
      });
    }

    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to accept, reject, or improve project requests
router.put('/process-request/:projectId/:action', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isMember) {
      return res.status(500).json({ message: `You're Already in a Group` });
    }
    const { projectId, action } = req.params;
    const request = await ProjectRequest.findById(projectId);

    if (!request) {
      return res.status(404).json({ message: 'Project Request not found' });
    }

    const supervisor = await Supervisor.findById(request.supervisor);
    // console.log('supervisor is ', supervisor);

    // Remove the request from the student's request array
    const filterRequests = user.requests.filter(reqId => !reqId.equals(projectId));
    user.requests = filterRequests;
    await user.save()

    if (action === 'accept') {
      // Check if a group with the same title exists
      const existingGroup = await Group.findOne({ 'projects.projectTitle': request.projectTitle });

      if (existingGroup) {
        console.log('existing group is ', existingGroup.projects[0].students)
        console.log('existing group is ', existingGroup.projects[0].students.length)
        // Check if the group has fewer than 2 students
        if (existingGroup.projects[0].students.length < 2) {
          // Add student to the existing group
          existingGroup.projects[0].students.push({
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          });

          // Update user properties
          user.group = existingGroup._id;
          user.isMember = true;
          user.pendingRequests = [];
          user.unseenNotifications.push({
            type: "Important",
            message: `You're now in Group: ${existingGroup.projects[0].projectTitle}`
          })

          // Notify the supervisor

          if (supervisor) {
            console.log('if state ment is running');
            supervisor.unseenNotifications.push({
              type: 'Important',
              message: `${user.name} accepted your request to join ${request.projectTitle}'s group`
            });
            await supervisor.save();
          }
          request.students.push(user._id)
          if (request.students.length === 2) {
            request.status = true;
          }

          await Promise.all([existingGroup.save(), user.save(), request.save()]);
          console.log('promise returns');
          return res.json({ success: true, message: 'Student added to the existing group' });
        } else {
          return res.json({ success: false, message: "Group is Already Filled." });
        }
      }

      // If no existing group or group is full, create a new group
      const newGroup = new Group({
        supervisor: supervisor.name,
        supervisorId: supervisor._id,
        projects: [{
          projectTitle: request.projectTitle,
          students: [{
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          }]
        }],
      });

      // Update user properties
      user.group = newGroup._id;
      user.isMember = true;

      // Notify the supervisor
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} accepted your request to join ${request.projectTitle}'s group`
        });
        const filteredIdea = supervisor.myIdeas.filter(idea => {
          return !idea.projectId.equals(request);
        })
        supervisor.myIdeas = filteredIdea;
        await supervisor.save();
      }

      await Promise.all([newGroup.save(), user.save()]);
      return res.json({ success: true, message: 'Student added to a new group' });
    } else if (action === 'reject') {
      console.log('reject statement starts')
      // Notify the supervisor about rejection
      const supervisor = await Supervisor.findById(request.supervisor);
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} rejected your request to join ${request.projectTitle}'s group`
        });
        await supervisor.save();
      }

      return res.json({ success: true, message: 'Request rejected successfully' });
    } else if (action === 'improve') {
      // Update project request details
      if (projectTitle) request.projectTitle = projectTitle;
      if (scope) request.scope = scope;
      if (description) request.description = description;
      await request.save();

      // Check if a group with the same title exists
      const existingGroup = await Group.findOne({ 'projects.projectTitle': request.projectTitle });

      if (existingGroup) {
        // Check if the group has fewer than 2 students
        if (existingGroup.projects[0].students.length < 2) {
          // Add student to the existing group
          existingGroup.projects[0].students.push({
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          });

          // Update user properties
          user.group = existingGroup._id;
          user.isMember = true;

          // Notify the supervisor
          const supervisor = await Supervisor.findById(request.supervisor);
          if (supervisor) {
            supervisor.unseenNotifications.push({
              type: 'Important',
              message: `${user.name} improved and accepted your request to join ${request.projectTitle}'s group`
            });
            await supervisor.save();
          }
          request.status = true;

          await Promise.all([existingGroup.save(), user.save(), request.save()]);
          return res.json({ success: true, message: 'Student added to the existing group after improving the request' });
        }
      }

      // If no existing group or group is full, create a new group
      const newGroup = new Group({
        projects: [{
          projectTitle: request.projectTitle,
          students: [{
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          }]
        }],
        supervisorId: request.supervisor,
        supervisor: supervisor.name,
      });

      // Update user properties
      user.group = newGroup._id;
      user.isMember = true;

      // Notify the supervisor
      // const supervisor = await Supervisor.findById(request.supervisor);
      if (supervisor) {
        supervisor.unseenNotifications.push({
          type: 'Important',
          message: `${user.name} improved and accepted your request to join ${request.projectTitle}'s group`
        }); const filteredIdea = supervisor.myIdeas.filter(idea => {
          return !idea.projectId.equals(request);
        })
        supervisor.myIdeas = filteredIdea;
        await supervisor.save();
      }

      await Promise.all([newGroup.save(), user.save()]);
      return res.json({ success: true, message: 'Student added to a new group after improving the request' });
    }

    res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-meeting', authenticateUser, async (req,res)=>{
  try {
    const student = await User.findById(req.user.id);
    if(!student){
      return res.status(404).json({ success: false, message: 'Student Not found' });
    }
    const group = await Group.findById(student.group);
    if(!group){
      return res.status(404).json({ success: false, message: 'Group Not found' });
    }
    const supervisor = await Supervisor.findById(group.supervisorId);
    if(!supervisor){
      return res.status(404).json({ success: false, message: 'Supervisor Not found' });
    }
    const project = group.projects[0].projectTitle;
    supervisor.unseenNotifications.push({
      type : "Important",
      message:`${student.name} has requested a meeting with you for group ${project}`,
    });
    await supervisor.save();
    return res.json({success:true, message:"Request sent to supervisor for meeting"});

  } catch (error) {
    console.error('error sending meeting request', error);
    return res.json({message:"Internal Server Error"});
  }
});

module.exports = router;