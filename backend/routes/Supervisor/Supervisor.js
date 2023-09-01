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
  const { name, designation, username, password, slots, department } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const supervisor = new Supervisor({ name, designation, username, password, slots, department });
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
router.put('/accept-project-request/:requestId/:action', authenticateUser, async (req, res) => {
  const { requestId, action } = req.params;

  try {
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId).populate('projectRequest');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }
    console.log('supervisor is 1 ', supervisor);
    console.log('Project of sup ius ', supervisor.projectRequest)

    // Check if a supervisor has slot or no
    if (supervisor.slots <= 0) {
      return res.status(400).json({ success: false, message: `You're slots are full` });
    }

    const projectRequest = supervisor.projectRequest.find(request => request._id.equals(requestId));
    if (!projectRequest) {
      return res.status(404).json({ success: false, message: 'Project request not found' });
    }
    if (projectRequest.supervisor) {
      const sup = await Supervisor.findById(projectRequest.supervisor);
      return res.status(404).json({ success: false, message: `Project is already supervised by ${sup.name}` });
    }
    console.log('ProjectRequest is 1 ', projectRequest);

    const user = await User.findById(projectRequest.user)

    if (action === 'accept') {

      if (user.isMember) {
        return res.status(404).json({ success: false, message: 'Student is already in a group' })
      }

      // GetProjectDetail for Project Id
      const projectDetail = await ProjectRequest.findById(projectRequest.project);
      console.log("ProjectDetail is ", projectDetail);

      // Check if user is already in the group
      if (projectDetail.status) {
        return res.status(400).json({ success: false, message: `The students for this Project are already full` });
      }

      // Find or create the relevant group
      let group = supervisor.groups.find(group => group.supervisor === supervisor.name);
      if (!group) {
        // Create the group document and obtain its ObjectId
        const newGroup = new Group({ supervisor: supervisor.name, supervisorId: supervisor._id, projects: [], students: [] });
        await newGroup.save();
        group = newGroup._id; // Store the ObjectId of the new group
        supervisor.groups.push(group);
      }
      console.log('group is ', group);


      // Find or create the relevant project in the group
      const groupDoc = await Group.findById(group); // Fetch the group document
      console.log('Project', groupDoc.projects);
      let project = groupDoc.projects.find(proj => proj.projectTitle === projectRequest.projectTitle);
      if (!project) {
        project = { projectTitle: projectDetail.projectTitle, projectId: requestId, students: [] };
        groupDoc.projects.push(project);
      }
      console.log("project is after initlialization", project)
      console.log('GroupDoc is ', groupDoc);

      console.log('User is ', user);

      console.log('Group doc studen is ', groupDoc.projects)
      // console.log('Group doc studen are ', project.students)
      // Add the user to the project's students array
      groupDoc.projects.map((group) => {
        if (group.projectTitle === projectDetail.projectTitle) {
          console.log('Inside map group is ', group)
          console.log('inside map', group.projectTitle)
          console.log('inside map', user.name)
          console.log('Student is ', group.students)
          console.log('ID is ', group.projectId)
          group.students.push({
            name: user.name, rollNo: user.rollNo, userId: user._id
          })
          console.log('After push')
        }
      });
      console.log('Project Detail is ', projectDetail)
      // projectDetail.forEach((proj)=>{
      //   console.log(proj.projectTitle)
      // })
      console.log('user id is ', user._id)
      // Decrease supervisor group by one
      supervisor.slots = supervisor.slots - 1;
      projectDetail.students.push(user._id);
      projectDetail.supervisor= (supervisor._id);
      projectDetail.isAccepted = true ;
      console.log('Project Supervisor is ', projectDetail.supervisor);
      // projectDetail.supervisor.push(supervisor._id);

      if (projectDetail.students.length === 2) {
        projectDetail.status = true;
      }

      // remove request from supervisor projectrequests
      const filteredRequest = supervisor.projectRequest.filter((request)=>{
        console.log('project is ', request.project);
        console.log('detail filter', projectDetail._id)
        console.log('tr/false',request.project.equals(projectDetail._id) )
        return !request.project.equals(projectDetail._id);
      });

      supervisor.projectRequest = filteredRequest;

      // Make user pending request zero and give him a notification
      user.pendingRequests = [];
      user.unseenNotifications.push({ message: `${supervisor.name} accepted you're proposal for ${projectDetail.projectTitle}` })
      supervisor.unseenNotifications.push({ message: `You've added ${user.name} to your group for Project: ${projectDetail.projectTitle} you have now slots left : ${supervisor.slots}` })

      console.log('Student is ', user)
      // Add group id to user
      user.group = groupDoc._id;
      user.isMember = true;
      // Save changes to supervisor and group
      await Promise.all([supervisor.save(), groupDoc.save(), user.save(), projectDetail.save()]);

      return res.json({ success: true, message: 'Project request accepted and user added to group' });

    }

    if (action === 'reject') {
      console.log('Reject code starts')
      // Remove the project request from supervisor's projectRequest array
      supervisor.projectRequest = supervisor.projectRequest.filter(request => !request._id.equals(requestId));
      await supervisor.save();

      // Remove the project request from student's pendingRequests array
      const student = await User.findById(projectRequest.user);
      if (student) {
        console.log('reject user is ', student);
        console.log('reject user pending request is  ', student.pendingRequests);

        const updatedPendingRequests = Array.from(student.pendingRequests).filter(request => {
          console.log('filter request is ', request);
          !request._id.equals(requestId)
        });
        console.log('updated requests is ', updatedPendingRequests)
        student.pendingRequests = updatedPendingRequests;
        student.unseenNotifications.push({
          message: `${supervisor.name} rejected you're request for ${projectRequest.projectTitle}`
        })
        await student.save();

        console.log('after reject is ', student.pendingRequests);
      }

      res.json({ success: true, message: 'Project request rejected successfully' });

    }

    if (action === 'improve') {
      const { projectTitle, description, scope } = req.body;
      console.log('improve starts')

      if (user.isMember) {
        return res.status(404).json({ success: false, message: 'Student is already in a group' })
      }
      

      // GetProjectDetail for Project Id
      const projectDetail = await ProjectRequest.findById(projectRequest.project);
      console.log("ProjectDetail is ", projectDetail);

      // Check if user is already in the group
      if (projectDetail.status) {
        return res.status(400).json({ success: false, message: `The students for this Project are already full` });
      }

      // Update the project details for the project request
      projectDetail.projectTitle = projectTitle;
      projectDetail.description = description;
      projectDetail.scope = scope;
      await projectDetail.save();

      // Find or create the relevant group
      let group = supervisor.groups.find(group => group.supervisor === supervisor.name);
      if (!group) {
        // Create the group document and obtain its ObjectId
        const newGroup = new Group({ supervisor: supervisor.name, supervisorId: supervisor._id, projects: [], students: [] });
        await newGroup.save();
        group = newGroup._id; // Store the ObjectId of the new group
        supervisor.groups.push(group);
      }
      console.log('group is ', group);


      // Find or create the relevant project in the group
      const groupDoc = await Group.findById(group); // Fetch the group document
      console.log('Project', groupDoc.projects);
      let project = groupDoc.projects.find(proj => proj.projectTitle === projectRequest.projectTitle);
      if (!project) {
        project = { projectTitle: projectDetail.projectTitle, projectId: requestId, students: [] };
        groupDoc.projects.push(project);
      }
      console.log("project is after initlialization", project)
      console.log('GroupDoc is ', groupDoc);

      console.log('User is ', user);

      console.log('Group doc studen is ', groupDoc.projects)
      // console.log('Group doc studen are ', project.students)
      // Add the user to the project's students array
      groupDoc.projects.map((group) => {
        if (group.projectTitle === projectDetail.projectTitle) {
          console.log('Inside map group is ', group)
          console.log('inside map', group.projectTitle)
          console.log('inside map', user.name)
          console.log('Student is ', group.students)
          console.log('ID is ', group.projectId)
          group.students.push({
            name: user.name,
            rollNo: user.rollNo,
            userId: user._id
          })
          console.log('After push')
        }
      });
      console.log('Project Detail is ', projectDetail)
      // projectDetail.forEach((proj)=>{
      //   console.log(proj.projectTitle)
      // })
      console.log('user id is ', user._id)
      // Decrease supervisor group by one
      supervisor.slots = supervisor.slots - 1;
      projectDetail.students.push(user._id)
      console.log('Project Supervisor is ', projectDetail.supervisor);
      // projectDetail.supervisor.push(supervisor._id);

      if (projectDetail.students.length === 2) {
        projectDetail.status = true;
      }

      // Make user pending request zero and give him a notification
      user.pendingRequests = [];
      user.unseenNotifications.push({ message: `${supervisor.name} accepted you're proposal for ${projectDetail.projectTitle}` })
      supervisor.unseenNotifications.push({ message: `You've added ${user.name} to your group for Project: ${projectDetail.projectTitle} you have now slots left : ${supervisor.slots}` })

      console.log('Student is ', user)
      // Add group id to user
      user.group = groupDoc._id;
      user.isMember = true;
      // Save changes to supervisor and group
      await Promise.all([supervisor.save(), groupDoc.save(), user.save(), projectDetail.save()]);

      res.json({ success: true, message: 'Project request improved and accepted and user added to group' });

    }

  } catch (err) {
    console.error('Error accepting project request:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Supervisor adds a student to their group for a specific project using student's rollNo
router.put('/add-student/:projectTitle/:rollNo', authenticateUser, async (req, res) => {
  const { projectTitle, rollNo } = req.params;

  try {
    const supervisorId = req.user.id;
    const supervisor = await Supervisor.findById(supervisorId).populate('groups.projects');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    if (supervisor.slots <= 0) {
      return res.status(404).json({ success: false, message: 'Your Slots are full' });
    }

    const projectDetail = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (projectDetail) {
      if (projectDetail.supervisor === supervisor._id) {
        const sup = await Supervisor.findById(projectDetail.supervisor)
        return res.status(404).json({ success: false, message: `Prject is already supervised by ${sup.name}` });
      }
    }

    console.log("supervisor group is ", supervisor.groups)

    // Find the student by roll number
    const student = await User.findOne({ rollNo: rollNo });
    if (student.isMember) {
      return res.status(404).json({ success: false, message: 'Student is already in group' });
    }

    supervisor.groups.map(async (grp) => {
      console.log('GRP is ', grp);
      const group = await Group.findById(grp);

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found with the specified project title' });
      }
      if (group) {
        console.log('GROUP is', group)
        console.log('TITLE is', group.projects)

        group.projects.map(async (proj) => {
          console.log('proj is ', proj);
          if (proj.projectTitle === projectTitle) {
            // Check if there are already two students in the group's project
            if (proj.students.length >= 2) {
              return res.status(400).json({ success: false, message: 'Group already has two students' });
            }

            if (!student) {
              return res.status(404).json({ success: false, message: 'Student not found with the specified roll number' });
            }
            console.log('Student is', student)
            proj.students.push({
              name: student.name,
              rollNo: student.rollNo,
              userId: student._id
            })

            //Push student to projectRequest
            const request = await ProjectRequest.findOne({ projectTitle: projectTitle });
            if (request) {
              console.log('Request is ', request);
              request.students.push(student._id);
            }

            student.unseenNotifications.push({
              message: `You've been added to the ${supervisor.name}'s group project is :${proj.projectTitle}`
            })
            student.group = group._id;
            student.isMember = true;

            supervisor.unseenNotifications.push({
              message: `You added ${student.name} tto group ${projectTitle} `
            })

            // Save changes to the supervisor's data
            await Promise.all([supervisor.save(), group.save(), student.save()])

            res.json({ success: true, message: 'Student added to the group with the specified project title' });
          }
        })
      }
    }
    )
  } catch (err) {
    console.error('Error adding student to group:', err);
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

    // Notify all users about the new project idea
    const users = await User.find();

    const userIds = users.map(user => user._id)
    console.log(userIds)

    // Create a new project request without specifying the student
    const projectRequest = new ProjectRequest({
      projectTitle, description,
      scope, status: false
    });

    await projectRequest.save();

    const notificationMessage = `A new project idea has been posted by Supervisor ${supervisor.name}`;

    users.forEach(async (user) => {
      user.unseenNotifications.push({ message: notificationMessage });
      await user.save();
    });

    res.json({ success: true, message: 'Project idea sent and users notified' });

  } catch (err) {
    console.error('Error sending project idea:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// view sent requests
router.get('/view-sent-proposals', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findOne({ _id: req.user.id });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // console.log('supervisor is ', supervisor);

    const requests = [];

    await Promise.all(
      Array.from(supervisor.projectRequest).map(async (request) => {
        const userObj = await User.findById(request.user);
        if (userObj) {
          const projectObj = await ProjectRequest.findById(request.project);
          if (projectObj) {
            console.log('project obj is ', projectObj);
            requests.push({
              requestId: request._id, projectId: projectObj._id, projectTitle: projectObj.projectTitle,
              scope: projectObj.scope, description: projectObj.description, studentName: userObj.name,
              rollNo: userObj.rollNo, studentId: userObj._id
            });
          }
        }
      })
    );

    const groupedRequests = [];
    const groupedRequestMap = {};

    requests.forEach((request) => {
      if (!groupedRequestMap[request.projectId] && request.studentId) {
        groupedRequestMap[request.projectId] = true;
        groupedRequests.push({
          requestId: request.requestId, projectId: request.projectId, projectTitle: request.projectTitle,
          scope: request.scope, description: request.description, studentDetails: []
        });
      }

      const existingGroup = groupedRequests.find((group) => group.projectId === request.projectId);
      if (existingGroup && request.studentId) {
        existingGroup.studentDetails.push({
          studentName: request.studentName, rollNo: request.rollNo, studentId: request.studentId
        });
      }
    });
    console.log('Group requests is ', groupedRequests)
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

router.get('/my-groups', authenticateUser, async (req, res) => {
  try {
    // Find the supervisor by user ID and populate the groups field
    const supervisor = await Supervisor.findOne({ _id: req.user.id }).populate('groups');

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Extract group information from the supervisor document
    const groups = supervisor.groups.map(group => ({
      supervisorName: supervisor.name,
      projectId: group._id, // Assuming groups are associated with projects
      projectTitle: group.projects[0].projectTitle, // Assuming each group has at least one project
      students: group.projects[0].students.map(student => ({
        name: student.name,
        rollNo: student.rollNo
      }))
    }));

    res.json({ success: true, groups });

  } catch (err) {
    console.error('Error fetching supervisor groups:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;