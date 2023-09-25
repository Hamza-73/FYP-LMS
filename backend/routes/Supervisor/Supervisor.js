const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const Supervisor = require('../../models/Supervisor/Supervisor');
const User = require('../../models/Student/User');
const authenticateUser = require('../../middleware/auth');
const { body, validationResult } = require('express-validator');
const JWT_KEY = 'hamzakhan1';
const bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const Group = require('../../models/GROUP/Group')
const ProjectRequest = require('../../models/ProjectRequest/ProjectRequest');
const Meeting = require('../../models/Meeting');
const Admin = require('../../models/Admin');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the supervisor by username
    const supervisor = await Supervisor.findOne({ username });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: "Supervisor not found" });
    }
    const check = await bcrypt.compare(password, supervisor.password)

    // Check if supervisor exists and if the password matches
    if (check) {
      // Generate JWT token
      const token = jwt.sign({ id: supervisor._id }, JWT_KEY);
      supervisor.token = token;
      await supervisor.save();

      res.json({ message: 'Supervisor Login successful', success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Invalid name or password' });
    }
  } catch (err) {
    console.log('error' + err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Create a new supervisor
router.post('/create', [
  body('name', 'Name is required').exists(),
  body('designation', 'Designation is required').exists(),
  body('password', 'Password is required').exists(),
], async (req, res) => {
  const { name, designation, username, password, slots, department, email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingSupervisor = await Supervisor.findOne({ username });
    if (existingSupervisor) {
      return res.status(409).json({ success: false, message: 'username already exists' });
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const supervisor = new Supervisor({ name, designation, username, password: secPass, slots, department, email });
      await supervisor.save();
      return res.json({ success: true, supervisor });
    }

  } catch (err) {
    console.error('error in creating ', err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Password reset route
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await Supervisor.findOne({ username });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isLogin) {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(newPassword, salt);
      user.password = secPass;
      user.isLogin = false;
      await user.save();
      return res.status(200).json({ success: true, message: 'Password reset successful' });
    }
    const admins = await Admin.find();
    Array.from(admins).forEach(async element => {
      element.supRequests.push({
        userId: user._id,
        name: user.name,
        designation: user.designation
      });
      await element.save();
    });
    return res.json({ success: true, message: "Request to Recover has been sent to Admin." })


  } catch (err) {
    console.error('error reseting password', err)
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

    const supervisor = await Supervisor.findById(id);
    if (supervisor.groups.length > 0) {
      return res.status(500).json({ success: false, message: `First Allocate groups under ${supervisor.name} to someone else.` });
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
router.get('/get-supervisors', async (req, res) => {

  try {
    const members = await Supervisor.find();
    res.json({ success: true, members })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

});


// Route to update student details
router.put('/edit/:id', async (req, res) => {
  const studentId = req.params.id;
  const updatedDetails = req.body;

  try {
    const updatedStudent = await Supervisor.findByIdAndUpdate(studentId, updatedDetails, { new: true });
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Supervisor accepts a user's project request and adds user to the relevant group
router.post('/improve-request/:requestId', authenticateUser, async (req, res) => {
  try {
    const { projectTitle , scope , description } = req.body ;
    const { requestId } = req.params;
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = supervisor.projectRequest.filter(request => request._id.equals(requestId));

    if (projectRequest.length <= 0) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    const check = await ProjectRequest.findById(projectRequest[0].project);

    if (check.supervisor && !check.supervisor.equals(req.user.id)) {
      const sup = await Supervisor.findById(check.supervisor);
      return res.status(404).json({ success: false, message: `Project is already supervised by ${sup.name}` });
    }

    console.log('ProjectRequest is 1 ', projectRequest);

    const user = await User.findById(projectRequest[0].user);
    
    // Remove the request
    const filteredRequest = supervisor.projectRequest.filter((request) => {
      return !request.project.equals(check._id);
    });

    supervisor.projectRequest = filteredRequest;
    await supervisor.save();

    if (user.isMember) {
      return res.status(404).json({ success: false, message: 'Student is already in a group' });
    }

    // Check if user is already in the group
    if (check.status) {
      return res.status(400).json({ success: false, message: `The students for this Project are already full` });
    }

    const findFirstExistingGroup = async (groupIds) => {
      for (const groupId of groupIds) {
        const group = await Group.findOne({
          'projects.projectTitle': check.projectTitle
        }).populate('supervisor projects.students');
        if (group) {
          return group; // Return the first existing group
        }
      }
      return null; // No existing group found
    };

    const supervisorGroups = supervisor.groups; // Assuming supervisor.groups is an array of group IDs
    let group = await findFirstExistingGroup(supervisorGroups);

    if (group) {
      // Handle the case when the group already exists
      const project = group.projects[0];
      console.log('project is ', project);
      if (project.students.length >= 2) {
        return res.status(500).json({ success: false, message: "The Group Is Already Filled" });
      }

      console.log('project student ', project.students);
      // Update the group, user, and supervisor
      project.students.push({
        name: user.name, rollNo: user.rollNo, userId: user._id
      });
      user.group = group._id;
      user.pendingRequests = [];
      user.isMember = true;

      // Remove the request
      const filteredRequest = supervisor.projectRequest.filter((request) => {
        return !request.project.equals(check._id);
      });

      supervisor.projectRequest = filteredRequest;
      check.students.push(user._id);
      if(check.students.length===2){
        check.status = true ;
      }
      check.projectTitle = projectTitle;
      check.scope = scope ;
      check.description = description ;
      user.unseenNotifications.push({ type: "Important", message: `${supervisor.name} accepted your proposal for ${check.projectTitle}` });
      supervisor.unseenNotifications.push({ type: "Important", message: `You've added ${user.name} to your group for Project: ${check.projectTitle} you have now slots left : ${supervisor.slots}` });

      // Save changes to group, user, supervisor, and projectRequest
      await Promise.all([group.save(), user.save(), supervisor.save(), check.save()]);
      return res.json({ success: true, message: "Accept request and student added to the group" });
    }

    // Handle the case when the group does not exist
    if (!group) {
      if (supervisor.slots <= 0) {
        return res.status(400).json({ success: false, message: `Your slots are full` });
      }

      // Create a new group
      const newGroup = new Group({ 
        supervisor: supervisor.name, supervisorId: supervisor._id,
        projects: []
      });
      await newGroup.save();
      supervisor.groups.push(newGroup._id);

      // Create a new project within the group
      const project = { projectTitle: check.projectTitle, projectId: requestId, students: [{
        userId : user._id ,
        name   : user.name ,
        rollNo : user.rollNo
      }] };
      newGroup.projects.push(project);

      // Update user and projectRequest
      user.group = newGroup._id;
      user.isMember = true;
      check.students.push(user._id);   
      if(check.students.length===2){
        check.status = true ;
      }

      // Remove the request
      const filteredRequest = supervisor.projectRequest.filter((request) => {
        return !request.project.equals(check._id);
      });

      supervisor.projectRequest = filteredRequest;

      // Decrease supervisor slots
      supervisor.slots--;

      // Notify the user and supervisor
      user.pendingRequests = [];
      check.projectTitle = projectTitle;
      check.scope = scope ;
      check.description = description ;
      user.unseenNotifications.push({ type: "Important", message: `${supervisor.name} accepted your proposal for ${check.projectTitle}` });
      supervisor.unseenNotifications.push({ type: "Important", message: `You've added ${user.name} to your group for Project: ${check.projectTitle} you have now slots left : ${supervisor.slots}` });

      // Save changes to group, user, supervisor, and projectRequest
      await Promise.all([newGroup.save(), user.save(), supervisor.save(), check.save()]);
      return res.json({ success: true, message: 'Project request accepted and user added to group' });
    }
  }  catch (err) {
    console.error('Error accepting project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Supervisor accepts a user's project request and adds user to the relevant group
router.post('/reject-request/:requestId', authenticateUser, async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = supervisor.projectRequest.filter(request => request._id.equals(requestId));
    if (projectRequest.length <= 0) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    const check = await ProjectRequest.findById(projectRequest[0].project);
 
    // Remove the request
    const filteredRequest = supervisor.projectRequest.filter((request) => {
      return !request.project.equals(check._id);
    });
    supervisor.projectRequest = filteredRequest;
    await supervisor.save();

    // Remove the project request from student's pendingRequests array
    const student = await User.findById(projectRequest[0].user);
    if (student) {
      console.log('student is ', student);
      const updatedPendingRequests = student.pendingRequests.filter(request => !request.equals(supervisor._id));
      student.pendingRequests = updatedPendingRequests;

      student.rejectedRequest.push(supervisor._id);

      student.unseenNotifications.push({
        type: "Important",
        message: `${supervisor.name} rejected your request, You cannot send request to this supervisor Anymore.`
      });

      console.log('check is ', check);
      // Optionally, you can perform additional actions after the delete if needed.
      if (check && !check.supervisor) {
          await ProjectRequest.findByIdAndDelete(check._id);
          console.log('deleting');
      }
      await student.save();
      // This line sends a response to the client.
      return res.json({ success: true, message: 'Project request rejected successfully' });
    }
  } catch (err) {
    console.error('Error accepting project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// accept student request
router.post('/accept-request/:requestId', authenticateUser, async (req, res) => {
  try {
    const { requestId } = req.params;
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const projectRequest = supervisor.projectRequest.filter(request => request._id.equals(requestId));

    if (projectRequest.length <= 0) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }

    const check = await ProjectRequest.findById(projectRequest[0].project);

    if (check.supervisor && !check.supervisor.equals(req.user.id)) {
      const sup = await Supervisor.findById(check.supervisor);
      return res.status(404).json({ success: false, message: `Project is already supervised by ${sup.name}` });
    }

    console.log('ProjectRequest is 1 ', projectRequest);

    const user = await User.findById(projectRequest[0].user);
    
    // Remove the request
    const filteredRequest = supervisor.projectRequest.filter((request) => {
      return !request.project.equals(check._id);
    });

    supervisor.projectRequest = filteredRequest;
    await supervisor.save();

    if (user.isMember) {
      return res.status(404).json({ success: false, message: 'Student is already in a group' });
    }

    // Check if user is already in the group
    if (check.status) {
      return res.status(400).json({ success: false, message: `The students for this Project are already full` });
    }

    const findFirstExistingGroup = async (groupIds) => {
      for (const groupId of groupIds) {
        const group = await Group.findOne({
          'projects.projectTitle': check.projectTitle
        }).populate('supervisor projects.students');
        if (group) {
          return group; // Return the first existing group
        }
      }
      return null; // No existing group found
    };

    const supervisorGroups = supervisor.groups; // Assuming supervisor.groups is an array of group IDs
    let group = await findFirstExistingGroup(supervisorGroups);

    if (group) {
      // Handle the case when the group already exists
      const project = group.projects[0];
      console.log('project is ', project);
      if (project.students.length >= 2) {
        return res.status(500).json({ success: false, message: "The Group Is Already Filled" });
      }

      console.log('project student ', project.students);
      // Update the group, user, and supervisor
      project.students.push({
        name: user.name, rollNo: user.rollNo, userId: user._id
      });
      user.group = group._id;
      user.pendingRequests = [];
      user.isMember = true;

      // Remove the request
      const filteredRequest = supervisor.projectRequest.filter((request) => {
        return !request.project.equals(check._id);
      });

      supervisor.projectRequest = filteredRequest;
      check.students.push(user._id);
      if(check.students.length===2){
        check.status = true ;
      }
      user.unseenNotifications.push({ type: "Important", message: `${supervisor.name} accepted your proposal for ${check.projectTitle}` });
      supervisor.unseenNotifications.push({ type: "Important", message: `You've added ${user.name} to your group for Project: ${check.projectTitle} you have now slots left : ${supervisor.slots}` });

      // Save changes to group, user, supervisor, and projectRequest
      await Promise.all([group.save(), user.save(), supervisor.save(), check.save()]);
      return res.json({ success: true, message: "Accept request and student added to the group" });
    }

    // Handle the case when the group does not exist
    if (!group) {
      if (supervisor.slots <= 0) {
        return res.status(400).json({ success: false, message: `Your slots are full` });
      }

      // Create a new group
      const newGroup = new Group({ 
        supervisor: supervisor.name, supervisorId: supervisor._id,
        projects: []
      });
      await newGroup.save();
      supervisor.groups.push(newGroup._id);

      // Create a new project within the group
      const project = { projectTitle: check.projectTitle, projectId: requestId, students: [{
        userId : user._id ,
        name   : user.name ,
        rollNo : user.rollNo
      }] };
      newGroup.projects.push(project);

      // Update user and projectRequest
      user.group = newGroup._id;
      user.isMember = true;
      check.students.push(user._id);
      if(check.students.length===2){
        check.status = true ;
      }
      // Remove the request
      const filteredRequest = supervisor.projectRequest.filter((request) => {
        return !request.project.equals(check._id);
      });

      supervisor.projectRequest = filteredRequest;

      // Decrease supervisor slots
      supervisor.slots--;

      // Notify the user and supervisor
      user.pendingRequests = [];
      user.unseenNotifications.push({ type: "Important", message: `${supervisor.name} accepted your proposal for ${check.projectTitle}` });
      supervisor.unseenNotifications.push({ type: "Important", message: `You've added ${user.name} to your group for Project: ${check.projectTitle} you have now slots left : ${supervisor.slots}` });

      // Save changes to group, user, supervisor, and projectRequest
      await Promise.all([newGroup.save(), user.save(), supervisor.save(), check.save()]);
      return res.json({ success: true, message: 'Project request accepted and user added to group' });
    }
  } catch (err) {
    console.error('Error in accepting', err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Supervisor sends a project request to a student for a specific project using student's rollNo
router.post('/add-student/:projectTitle/:rollNo', authenticateUser, async (req, res) => {
  const { projectTitle, rollNo } = req.params;

  try {
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    console.log('rollNo i s', rollNo);

    // check request is available or not
    const projectRequest = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'FYP Idea not found' });
    }
    console.log('project is', projectRequest)
    if (projectRequest.status) {
      return res.status(500).json({ success: false, message: 'Group is already filled' });
    }

    // Check if the student is already in a group
    const student = await User.findOne({ rollNo: rollNo });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with the specified roll number' });
    }

    if (student.isMember) {
      return res.status(400).json({ success: false, message: 'Student is already in a group' });
    }

    // Notify the student about the new project request
    student.unseenNotifications.push({
      type: 'Important',
      message: `${supervisor.name} sent you a project request for the project: ${projectTitle}`
    });

    supervisor.unseenNotifications.push({
      type: "Important", message: `You've send request to ${student.name} to join ${projectTitle}`
    })

    student.requests.push(projectRequest._id);

    // Save the changes to the student and project request
    await Promise.all([student.save(), supervisor.save()]);

    res.json({ success: true, message: 'Project request sent to the student' });

  } catch (err) {
    console.error('Error sending project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// Supervisor sends a project request and notifies all users
router.post('/send-project-idea', authenticateUser, async (req, res) => {
  const { projectTitle, description, scope } = req.body;

  try {
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    if (supervisor.slots <= 0) {
      return res.status(500).json({ success: false, message: `You're Slots are full you cannot end any requests now` });
    }
    // Notify all users about the new project idea
    const checkRequest = await ProjectRequest.findOne({ projectTitle });
    if (checkRequest) {
      return res.status(500).json({ success: false, message: 'FYP Idea with this Project Title already exists.' });
    }

    const users = await User.find();

    // const userIds = users.map(user => user._id)
    // console.log(userIds);


    // Create a new project request without specifying the student
    const projectRequest = new ProjectRequest({
      supervisor: supervisor._id,
      projectTitle, description,
      scope, status: false
    });

    await projectRequest.save();

    const notificationMessage = `A new project idea has been posted by Supervisor ${supervisor.name}`;

    users.forEach(async (user) => {
      if (!user.isMember) {
        user.unseenNotifications.push({ type: "Important", message: notificationMessage });
        await user.save();
      }
    });
    const currentDate = new Date();
    supervisor.myIdeas.push({
      projectId: projectRequest._id,
      time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
      date: new Date()
    });
    await supervisor.save();
    return res.json({ success: true, message: 'Project idea sent and users notified' });

  } catch (err) {
    console.error('Error sending project idea:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// view sent requests
router.get('/view-sent-proposals', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findOne({ _id: req.user.id });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const requests = [];

    await Promise.all(
      Array.from(supervisor.projectRequest).map(async (request) => {
        const userObj = await User.findById(request.user);
        if (userObj) {
          const projectObj = await ProjectRequest.findById(request.project);
          if (projectObj) {
            requests.push({
              requestId: request._id,
              projectId: projectObj._id,
              projectTitle: projectObj.projectTitle,
              scope: projectObj.scope,
              description: projectObj.description,
              studentName: userObj.name,
              rollNo: userObj.rollNo,
              studentId: userObj._id
            });
          }
        }
      })
    );

    const groupedRequests = [];

    requests.forEach((request) => {
      const existingGroup = groupedRequests.find((group) => group.projectId === request.projectId);
      if (existingGroup) {
        existingGroup.studentDetails.push({
          studentName: request.studentName,
          rollNo: request.rollNo,
          studentId: request.studentId
        });
      } else {
        groupedRequests.push({
          requestId: request.requestId,
          projectId: request.projectId,
          projectTitle: request.projectTitle,
          scope: request.scope,
          description: request.description,
          studentDetails: [
            {
              studentName: request.studentName,
              rollNo: request.rollNo,
              studentId: request.studentId
            }
          ]
        });
      }
    });

    // Filter out requests where projectRequest.students is empty or undefined
    const filteredRequests = groupedRequests.filter(group => group.studentDetails.length > 0);

    res.json({ success: true, request: filteredRequests });

  } catch (err) {
    console.error('Error fetching sent proposals:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Give marks
router.put('/give-marks/:groupId', authenticateUser, async (req, res) => {
  try {
    const { marks, external } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' })
    }
    console.log('group is ', group);
    if (!group.proposal || !group.documentation || !group.finalSubmission) {
      return res.status(500).json({ success: false, message: 'One of the Documentation is Pending' });
    }
    if (group.vivaDate > new Date()) {
      return res.status(201).json({ success: false, message: 'VIVA has not been taken yet' });
    }

    group.marks = marks; group.external = external;
    group.projects.map(project => {
      console.log(' project is ', project);
      project.students.map(async student => {
        console.log("student ", student);
        const studentObj = await User.findById(student.userId);
        if (!studentObj) {
          return res.status(404).json({ success: false, message: 'Student not found' })
        }
        console.log('student obj sis ', studentObj)
        studentObj.marks = marks;
        studentObj.external = external;
        await studentObj.save();
      });
    });

    await group.save(); // Save the group separately after updating students' marks
    res.json({ success: true, message: `Marks ${marks} and External ${external}, given to ${group.supervisor}'s group` });

  } catch (error) {
    console.error('Error fetching sent proposals:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/editProposal/:projectId', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findOne({ _id: req.user.id });
    const updatedDetails = req.body;
    const { projectId } = req.params;

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const idea = await ProjectRequest.findByIdAndUpdate({ _id: projectId }, updatedDetails, { new: true });
    if (!idea) {
      return res.status(404).json({ success: false, message: 'Project Idea not found' });
    }


    supervisor.unseenNotifications.push({
      type: "Important",
      message: `FYP Idea edited Successfully`
    });

    await Promise.all([supervisor.save(), idea.save()]);

    res.json({ success: true, message: "Idea Edited Successfully", idea });

  } catch (error) {

  }
});

// Delete your idea
router.delete('/deleteProposal/:projectId', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.user.id);
    const projectId = req.params.projectId;

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // check if idea belong to this supervisor or not
    const check = supervisor.myIdeas.map(idea => {
      return idea.projectId.equals(projectId)
    });
    console.log('check is ', check);
    if (!check) {
      return res.status(500).json({ success: false, message: "This Idea Doesnot belong to you" });
    }

    // Attempt to delete the idea
    const idea = await ProjectRequest.findByIdAndDelete({ _id: projectId });

    // console.log('idea is ', idea);

    // Handle the case where there was an error during deletion
    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found or already deleted' });
    }

    // Update supervisor's notifications and myIdeas
    supervisor.unseenNotifications.push({
      type: 'Important',
      message: 'FYP Idea deleted Successfully'
    });

    const filteredRequest = supervisor.myIdeas.filter((ideas) => {
      return !ideas.projectId.equals(idea._id);
    });
    // console.log('filtered request is ', filteredRequest)

    supervisor.myIdeas = filteredRequest;
    // console.log('supervisor idea is ',supervisor.myIdeas )

    // Save both supervisor and idea, and wait for both promises to resolve
    // console.log('before save')
    await Promise.all([supervisor.save()]);
    // console.log('after save')
    return res.json({ success: true, message: 'Idea deleted Successfully' });
  } catch (error) {
    console.error('error in deleting fyp', error);
    return res.status(500).json({ success: false, message: `Internal server error` });
  }
});



router.get('/my-groups', authenticateUser, async (req, res) => {
  try {
    // Find the supervisor by user ID and populate the groups field
    const supervisor = await Supervisor.findOne({ _id: req.user.id }).populate('groups');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const groups = supervisor.groups;

    res.json({ success: true, groups });

  } catch (err) {
    console.error('Error fetching supervisor groups:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/detail', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID from the token payload

    const member = await Supervisor.findById(userId);

    if (!member) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Return the student details
    return res.json({ success: true, member, user: userId });
  } catch (error) {
    console.error('error is ', error)
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get supervisor ideas
router.get('/myIdeas', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const myIdea = [];

    const ideaPromises = supervisor.myIdeas.map(async (idea) => {
      const project = await ProjectRequest.findById(idea.projectId);
      if (!project) {
        return null; // Return null if project not found
      }
      myIdea.push({
        projectId: project._id,
        projectTitle: project.projectTitle,
        description: project.description,
        scope: project.scope,
        time: idea.time,
        date: idea.date
      }); // Return the project if found
    });

    const ideas = await Promise.all(ideaPromises);

    // Filter out null values (projects not found)
    const validIdeas = ideas.filter((idea) => idea !== null);

    return res.json({ success: true, supervisor: supervisor.name, ideas: myIdea });
  } catch (error) {
    console.error('error is ', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/notification', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const supervisor = await Supervisor.findById(userId);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }
    const notification = supervisor.unseenNotifications;
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
    const user = await Supervisor.findById(userId);

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

router.put('/reviews/:groupId/:index', authenticateUser, async (req, res) => {
  try {
    const { groupId, index } = req.params;
    const { review } = req.body;
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.docs[index]) {
      return res.json({ message: "invalid index" })
    }
    group.docs[index].review = review;
    await group.save();

    return res.json({ success: true, message: `Reviews Given Sucessfully` });

  } catch (error) {
    console.error('error in giving reviw', error);
    return res.json({ message: "Internal Server Error" });
  }
});

module.exports = router;