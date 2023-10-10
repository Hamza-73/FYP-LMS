const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Committee = require('../../models/Committee');
const User = require('../../models/User');
const Group = require('../../models/Group');
const Supervisor = require('../../models/Supervisor')
const { body, validationResult } = require('express-validator');
const Viva = require('../../models/Viva')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateUser = require('../../middleware/auth')
const JWT_KEY = 'hamzakhan1'
const SharedRules = require('../../models/SharedRules');
const Admin = require('../../models/Admin');
const nodemailer = require('nodemailer');
const ProjectRequest = require('../../models/ProjectRequest');
const Allocation = require('../../models/Allocation');


// Registration route
router.post('/register', [
  body('fname', 'First name should be at least 3 characters').exists(),
  body('lname', 'Last name should not be blank').exists(),
  body('username', 'Enter a valid username').isLength({ min: 4 }),
  body('department', 'Department should only contain alphabetic characters').isAlpha(),
  body('designation', 'Designation cannot be left blank').exists(),
  body('password', 'Password must be at least 4 characters').isLength({ min: 4 }),
], async (req, res) => {
  const { fname, lname, username, department, designation, password, email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the username or the combination of first and last name already exists in the database
    const existingUser = await Committee.findOne({ username: username });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username or name already exists' });
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      // Create a new user if the username is unique
      const newUser = new Committee({ fname, lname, username, department, designation, password: secPass, email });
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
    console.error('error in registering ', err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login route for admins
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await Committee.findOne({ username });

    // Check if the user is an admin or a committee member with an "admin" role
    if (admin) {
      // If the user is an admin
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (isPasswordValid) {
        // Generate JWT token for admin
        const token = jwt.sign({ id: admin.id }, JWT_KEY);

        res.json({ message: 'Committee login successful', success: true, token });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      // If the user is not an admin, check if they are a committee member with an "admin" role
      const supervisor = await Supervisor.findOne({ username, isCommittee: true });

      if (supervisor) {
        const isPasswordValid = await bcrypt.compare(password, supervisor.password);

        if (isPasswordValid) {
          // Generate JWT token for committee member acting as an admin
          const token = jwt.sign({ id: supervisor.id }, JWT_KEY);

          res.json({ message: 'Committee login successful', success: true, token });
        } else {
          res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
      } else {
        res.status(404).json({ success: false, message: "Commiittee Member  not found" });
      }
    }
  } catch (err) {
    console.error('Error in admin login', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Password reset route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  Committee.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.send({ success: false, message: "Committee not existed" })
      }

      const token = jwt.sign({ id: user.id }, JWT_KEY, { expiresIn: '5m' });

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'YOUR_EMAIL_HERE',
          pass: 'PASSWORD'
        }
      });
      console.log('email is ', email);
      var mailOptions = {
        from: 'YOUR_EMAIL',
        to: email,
        subject: 'Reset Password Link',
        html: `<h4>The Link will expire in 5m</h4> <br> <p><strong>Link:</strong> <a href="http://localhost:3000/supervisorMain/reset_password/${user._id}/${token}">http://localhost:3000/supervisorMain/reset_password/${user._id}/${token}</a></p>
        <p>The link will expire in 5 minutes.</p>`
      };
      // console.log('mailoption is')
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          return res.send({ success: true, message: "Check Your Email" })
        }
      });
    })
})

router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" })
    } else {
      bcrypt.hash(password, 10)
        .then(hash => {
          Committee.findByIdAndUpdate({ _id: id }, { password: hash })
            .then(u => res.send({ success: true, message: "Password Updated Successfully" }))
            .catch(err => { console.error('errror in changing password', err); res.send({ success: false, message: "Error in Changing Pasword" }) })
        })
        .catch(err => { console.error('errror in changing password', err); res.send({ success: false, message: "Error in Changing Pasword" }) })
    }
  })
})



//get all committee members
router.get('/get-members', async (req, res) => {

  try {
    const allCommitte = await Committee.find();
    const superviors = await Supervisor.find({ isCommittee: true });

    // Merge admin and committee members into the members array
    const members = [...allCommitte, ...superviors];

    if (members.length === 0) {
      res.status(404).json({ message: 'Members Not Found' });
    } else {
      res.json({
        success: true,
        members
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

});

// Route to delete an Committee by ID
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Committee.findByIdAndDelete(id);
    if (!admin) {
      const committee = await Supervisor.findById(id);
      if (committee) {
        committee.isCommittee = false;
        await committee.save();
        return res.json({ success: true, message: "Committee Deleted Successfully" });
      } else {
        return res.json({ success: false, message: "Committee Member Not Found" })
      }
    }
    res.json({ message: 'Committee Member deleted' });
  } catch (error) {
    console.error('error is ', error)
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Define a route to get shared rules for committee members
router.get('/getrules', async (req, res) => {
  try {
    const sharedRules = await SharedRules.findOne();
    if (!sharedRules) {
      return res.status(404).json({ message: 'Shared rules not found' });
    }

    res.json({ rule: sharedRules.rule });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Define a route to update shared rules
router.post('/addrules', async (req, res) => {
  try {
    const sharedRules = await SharedRules.findOne();
    if (!sharedRules) {
      return res.status(404).json({ message: 'Shared rules not found' });
    }

    sharedRules.rule = req.body.rule;
    await sharedRules.save();

    res.json({ message: 'Shared rules updated successfully', sharedRules });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Define a route to fetch rules for a specific role
router.get('/getrules/:role', async (req, res) => {
  try {
    const { role } = req.params;

    // Find the shared rules document
    const sharedRules = await SharedRules.findOne();
    if (!sharedRules) {
      return res.status(404).json({ message: 'Shared rules not found' });
    }

    // Find the specific role's rules in the shared rules
    const targetRule = sharedRules.rule.find(r => r.role === role);
    if (!targetRule) {
      return res.status(404).json({ message: 'Rules for the specified role not found' });
    }

    res.json({ role, rules: targetRule.rules });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get committee member detail
router.get('/detail', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  try {
    console.log(userId)
    const member = await Committee.findById(userId);
    if (!member) {
      const member = await Supervisor.findById(userId);
      if (!member) {
        const member = await Supervisor.findOne({ _id: userId, isAdmin: true });
        if (!member) {
          return res.status(404).json({ message: 'Member not found' });
        } else {
          return res.send({ success: true, member, user: userId });
        }
      } else {
        return res.send({ success: true, member, user: userId });
      }
    }
    return res.send({ success: true, member, user: userId });
  } catch (error) {
    console.error('Error fetching membetrs', err);
    return res.status(404).json({ message: 'Internal server error' });
  }
});

// Define a route to  rules for a specific role
router.put('/editrules/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { rules } = req.body;

    // Find the shared rules document
    const sharedRules = await SharedRules.findOne();
    if (!sharedRules) {
      return res.status(404).json({ message: 'Shared rules not found' });
    }

    // Find the specific role's rules in the shared rules
    const targetRule = sharedRules.rule.find(r => r.role === role);
    if (!targetRule) {
      return res.status(404).json({ message: 'Rules for the specified role not found' });
    }

    // Update the rules for the specified role
    targetRule.rules = rules;

    // Save the updated shared rules
    await sharedRules.save();

    const students = await User.find();
    if (!students) {
      return res.status(404).json({ message: 'No Students Found' });
    }

    const superviors = await Supervisor.find();
    if (!superviors) {
      return res.status(404).json({ message: "No Supervisor Found" });
    }

    const notification = {
      type: "Important",
      message: "New Rules added by Committee Members"
    }

    students.map(student => {
      student.unseenNotifications.push(notification);
      student.save();
    })

    superviors.map(student => {
      student.unseenNotifications.push(notification);
      student.save();
    })

    return res.json({ message: 'Rules for the specified role updated successfully', sharedRules });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to update student details
router.put('/edit/:id', async (req, res) => {
  const studentId = req.params.id;
  const updatedDetails = req.body;

  try {
    const updatedStudent = await Committee.findByIdAndUpdate(studentId, updatedDetails, { new: true });
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// give remarks to students
router.post('/remarks/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { remarks } = req.body;


  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.remarks = remarks;
    const promises = group.projects[0].students.map(async stu => {
      console.log('Processing student: ', stu);
      try {
        const student = await User.findById(stu.userId);
        console.log('Student processed successfully: ', student.name);
        student.unseenNotifications.push({
          type: 'Important',
          message: `Your Group has been given remarks by the Committee`
        });
        await student.save(); // Save the changes to the student
        return student;
      } catch (error) {
        console.error('Error processing student: ', error);
        throw error; // Rethrow the error to reject the promise
      }
    });

    // Wait for all async operations (saving students) to complete
    await Promise.all(promises);

    // Save the group after all students have been updated
    await group.save();

    res.json({ success: true, message: 'Remarks given successfully', remarks });
  } catch (error) {
    console.error('Error giving remarks', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    if (!groups) {
      return res.status(404).json({ message: 'Groups not found' });
    }

    // Create an object to hold the grouped data
    const groupedData = {};

    groups.forEach((group) => {
      const supervisorName = group.supervisor;
      const supervisorId = group.supervisorId;
      const remarks = group.remarks;
      const id = group._id;
      const projectTitle = group.projects[0].projectTitle;
      const students = group.projects[0].students.map((student) => ({
        name: student.name,
        rollNo: student.rollNo,
      }));

      // If the supervisorName is not in groupedData, create an entry for it
      if (!groupedData[supervisorName]) {
        groupedData[supervisorName] = {
          supervisorName: supervisorName,
          supervisorId: supervisorId,
          groups: [],
        };
      }

      // Add the group to the supervisor's groups
      groupedData[supervisorName].groups.push({
        groupId: id,
        projectTitle: projectTitle,
        students: students,
        remarks: remarks
      });
    });

    // Convert the groupedData object to an array
    const transformedGroups = Object.values(groupedData);

    res.json(transformedGroups);
  } catch (error) {
    console.error('Error fetching groups', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/progress', async (req, res) => {
  try {
    const groups = await Group.find();
    if (!groups) {
      return res.status(404).json({ message: 'Groups not found' });
    }
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching groups', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add due date
router.post('/dueDate', async (req, res) => {
  try {
    console.log('due datw starts')
    const { type, dueDate, instructions } = req.body;
    const currentDate = new Date();
    const newDate = new Date(dueDate);
    // Validate if the due date is not behind the current date
    if (new Date(dueDate) < currentDate) {
      return res.status(400).json({ message: "Due Date cannot be behind the current date" });
    }

    const groups = await Group.find();

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "Groups Not Found" });
    }

    if ((type === 'documentation') && !groups[0].propDate) {
      return res.status(500).json({ success: false, message: "Due Date For Propsal Has Not been announced Yet." });
    }

    else if ((type === 'documentation') && groups[0].propDate > currentDate) {
      return res.status(500).json({ success: false, message: "Due Date For Propsal is not ended yet." });
    }


    const promiseArray = [];

    for (const group of groups) {
      for (const project of group.projects) {
        console.log('project is ', project.projectTitle)
        for (const student of project.students) {
          const stu = await User.findById(student.userId);
          if (!stu) {
            continue; // Skip this student and continue with the next one
          }
          // console.log('students is ', stu);
          if (type === 'proposal') {
            group.propDate = dueDate;
            stu.propDate = dueDate;
          } else if (type === 'documentation') {
            group.docDate = dueDate;
            stu.docDate = dueDate;
            console.log('documentation');
          }
          group.instructions = instructions;
          stu.unseenNotifications.push({
            type: "Important",
            message: `Deadline for ${type[0].toUpperCase() + type.slice(1, type.length)} has been added ${dueDate}`
          });
          promiseArray.push(stu.save()); // Push the save promise to the array
        }
      }
      promiseArray.push(group.save()); // Push the save promise to the array
    }

    // Use Promise.all to execute all promises in parallel
    await Promise.all(promiseArray);

    return res.status(200).json({ message: "Due Date Updated Successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/allocate-group', async (req, res) => {
  try {
    const { projectTitle, newSupervisor } = req.body;

    // Check if a group with the provided projectTitle exists
    const group = await Group.findOne({ 'projects.projectTitle': projectTitle }).populate('supervisor');
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove the group ID from the previous supervisor's groups
    const previousSupervisor = await Supervisor.findById(group.supervisorId);
    if (!previousSupervisor) {
      return res.json({ success: false, message: "Supervisor Not Found" });
    }

    const projectRequest = await ProjectRequest.findOne({ projectTitle: projectTitle });
    if (!projectRequest) {
      return res.json({ success: false, message: "Project Not Found" });
    }

    // Check if the new supervisor has slots left
    const supervisor = await Supervisor.findOne({ username: newSupervisor });
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'New supervisor not found' });
    }

    if (previousSupervisor._id.equals(supervisor._id)) {
      return res.json({ success: false, message: "The group Already Belong to this Supervisor select another one" })
    }

    if (supervisor.slots.length == 0) {
      return res.status(400).json({ success: false, message: 'New supervisor does not have available slots' });
    }
    previousSupervisor.groups = previousSupervisor.groups.filter(groupId => !groupId.equals(group._id));
    previousSupervisor.slots += 1;
    // get requests to save it to new supervisor's projectRequest
    const filteredRequest = previousSupervisor.projectRequest.filter(request => {
      return request.project.equals(projectRequest._id);
    });
    previousSupervisor.unseenNotifications.push({
      type: "Important", message: `You're group ${projectTitle} has been alocated to ${supervisor.name}`
    })
    previousSupervisor.projectRequest = previousSupervisor.projectRequest.filter(request => {
      return !request.project.equals(projectRequest._id);
    });

    // Allocate the group to the new supervisor
    group.supervisor = supervisor.name;
    group.supervisorId = supervisor._id;
    // Add the group ID to the new supervisor's groups
    supervisor.groups.push(group._id);
    supervisor.slots -= 1;
    // Create an allocation object
    const currentDateTime = new Date();

    // Extract date and time from the current date and time object
    const currentDate = currentDateTime.toISOString().split('T')[0];
    const currentTime = currentDateTime.toISOString().split('T')[1].split('.')[0];
    const allocation = new Allocation({
      previousSupervisor: [{
        id: previousSupervisor._id,
        name: previousSupervisor.name
      }],
      newSupervisor: [{
        id: supervisor._id,
        name: supervisor.name
      }],
      groupName: projectRequest.projectTitle,
      date: currentDate,
      time: currentTime
    });

    // Save the allocation object to the database
    await allocation.save();
    // Push filtered request to new supervisor's projectRequest
    if (!supervisor.projectRequest) {
      supervisor.projectRequest = []; // Initialize as an empty array if it's undefined
    }
    supervisor.projectRequest = supervisor.projectRequest.concat(filteredRequest);
    projectRequest.supervisor = supervisor._id;
    supervisor.unseenNotifications.push({
      type: "Important", message: `You've been allocated a group ${projectTitle}`
    })

    await Promise.all([group.save(), supervisor.save(), previousSupervisor.save(), projectRequest.save()]);

    res.json({ success: true, message: 'Group allocated to the new supervisor' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/make-extension/:requestId', authenticateUser, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { date } = req.body;
    console.log('date is ', date)
    const [year, month, day] = date.split('-');
    const formattedDate = `${month}-${day}-${year}`;
    const newDate = new Date(formattedDate);
    let supervisor;
    supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      supervisor = await Committee.findById(req.user.id);
      if (!supervisor) {
        return res.json({ message: "user Not Found" });
      }
    }
    const request = supervisor.requests.filter(request => {
      return request._id.equals(requestId);
    });
    if (request.length <= 0) {
      return res.json({ success: false, message: "Request Not Found" });
    }
    const group = await Group.findOne({
      'projects.projectTitle': request[0].group
    });
    if (!group) {
      return res.json({ success: false, message: "Group Not Found" });
    }
    group.docDate = newDate;
    await group.save();
    group.projects[0].students.forEach(async stu => {
      const stuObj = await User.findById(stu.userId)
      stuObj.unseenNotifications.push({
        type: "Important", message: `Time extended for Documentation`
      });
      await stuObj.save();
    });
    const supervisors = await Supervisor.find({ isAdmin: true });
    const committeeMembers = await Committee.find({ isAdmin: true });
    supervisors.forEach(async sup => {
      const filteredRequest = sup.requests.filter(req => {
        return !req._id.equals(requestId);
      });
      sup.requests = filteredRequest
      await sup.save()
    });
    committeeMembers.forEach(async sup => {
      const filteredRequest = sup.requests.filter(req => {
        return !req._id.equals(requestId);
      });
      sup.requests = filteredRequest
      await sup.save()
    });
    return res.json({
      success: true, message: "Time Extended"
    });
  } catch (error) {
    console.error('error in handling extenion', error);
    return res.json({ message: "Internal Server Error" });

  }
})

module.exports = router;