const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Committee = require('../../models/Committee');
const User = require('../../models/Student/User');
const Group = require('../../models/GROUP/Group');
const Supervisor = require('../../models/Supervisor/Supervisor')
const { body, validationResult } = require('express-validator');
const Viva = require('../../models/Viva/Viva')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateUser = require('../../middleware/auth')
const JWT_KEY = 'hamzakhan1'
const SharedRules = require('../../models/SharedRules')


// Registration route
router.post('/register', [
  body('fname', 'First name should be at least 4 characters').exists(),
  body('lname', 'Last name should not be blank').exists(),
  body('username', 'Enter a valid username').isLength({ min: 4 }),
  body('department', 'Department should only contain alphabetic characters').isAlpha(),
  body('designation', 'Designation cannot be left blank').exists(),
  body('password', 'Password must be at least 4 characters').isLength({ min: 4 }),
], async (req, res) => {
  const { fname, lname, username, department, designation, password } = req.body;

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
      const newUser = new Committee({ fname, lname, username, department, designation, password: secPass });
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


// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await Committee.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "Committee Member not found" });
    }
    const check = (await bcrypt.compare(password, user.password))
    // Check if user exists and if the password matches
    console.log('check is', check)
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
    console.error(err)
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Password reset route
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await Committee.findOne({ username });

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



//get all committee members
router.get('/get-members', async (req, res) => {

  try {
    const members = await Committee.find();
    res.json({ success: true, members })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

});

//delete member
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid committee member ID' });
    }

    const deletedMember = await Committee.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Committee member not found' });
    }

    res.json({ message: 'Committee member deleted successfully' });
  } catch (error) {
    console.error('Error deleting committee member:', error);
    res.status(500).json({ message: 'Error deleting committee member', error });
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
      return res.status(404).json({ message: 'Member not found' });
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
router.put('/remarks/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const { remarks } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    group.remarks = remarks;
    group.projects.map(project => {
      project.students.map(async stu => {
        const student = await User.findById(stu.userId);
        if (!student) {
          return res.status(404).json({ message: 'Student not found' });
        }
        student.unseenNotifications.push({
          type: 'Important', message: `You're Group has been given remarks by Committee`
        })
      })
    })
    await group.save();
    res.json({ message: `Remarks have been given to the group ${group.supervisor} , ${group.projects.map(el => el.projectTitle)}`, remarks });

  } catch (error) {
    console.error('error giving marks', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    if (!groups) {
      return res.status(404).json({ message: 'Groups not found' });
    }

    const transformedGroups = [];

    groups.forEach((group) => {
      const supervisorName = group.supervisor;
      const remarks = group.remarks;
      const id = group._id;
      const projects = group.projects.map((project) => {
        const projectTitle = project.projectTitle;
        const students = project.students.map((student) => ({
          name: student.name,
          rollNo: student.rollNo,
        }));
        return { projectTitle, students };
      });

      transformedGroups.push({
        supervisor: supervisorName,
        remarks: remarks,
        id: id,
        projects: projects,
      });
    });

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
    const { type, dueDate } = req.body;
    // Validate if the due date is not behind the current date
    const currentDate = new Date();
    if (new Date(dueDate) < currentDate) {
      return res.status(400).json({ message: "Due Date cannot be behind the current date" });
    }

    const groups = await Group.find();

    if (!groups || groups.length === 0) {
      return res.status(404).json({ message: "Groups Not Found" });
    }

    const promiseArray = [];

    for (const group of groups) {
      for (const project of group.projects) {
        for (const student of project.students) {
          // console.log('project is ', project)
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
          } else if (type === 'final') {
            group.finalDate = dueDate;
            stu.finalDate = dueDate;
            console.log('final');
          }
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

router.put('/allocate-group',  async (req, res) => {
  try {
    const { projectTitle, newSupervisor } = req.body;

    // Check if a group with the provided projectTitle exists
    const group = await Group.findOne({ 'projects.projectTitle': projectTitle }).populate('supervisor');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    // Remove the group ID from the previous supervisor's groups
    const previousSupervisor = await Supervisor.findById(group.supervisorId);
    if (previousSupervisor) {
      previousSupervisor.groups = previousSupervisor.groups.filter(groupId => !groupId.equals(group._id));
      previousSupervisor.slots +=1;
      await previousSupervisor.save();
    }

    // Check if the new supervisor has slots left
    const supervisor = await Supervisor.findOne({username : newSupervisor});

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'New supervisor not found' });
    }

    if (supervisor.slots.length == 0) {
      return res.status(400).json({ success: false, message: 'New supervisor does not have available slots' });
    }

    // Allocate the group to the new supervisor
    group.supervisor = supervisor.name;
    group.supervisorId = supervisor._id;

    // Add the group ID to the new supervisor's groups
    supervisor.groups.push(group._id);
    supervisor.slots -=1;

    await Promise.all([group.save(), supervisor.save()]);

    res.json({ success: true, message: 'Group allocated to the new supervisor' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;