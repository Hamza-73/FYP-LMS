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
const SharedRules = require('../../models/SharedRules');
const moment = require('moment');


// Schedule a viva for a specific group's project
router.post('/schedule-viva', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime } = req.body;

    // Find the group by project title
    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    console.log('Group is ', group)
    if (!(group.isProp && group.isDoc)) {
      return res.status(500).json({ success: false, message: `Documentation or Proposal is Pending` })
    }
    const parsedDate = moment(vivaDate, 'DD-MM-YYYY').toDate();
    // Iterate through each project within the group and schedule a viva for each project
    group.projects.forEach(async (project) => {
      console.log('Project is ', project)
      console.log('Group projects is ', group.projects.students)
      const viva = new Viva({
        group: group._id,
        projectTitle: project.projectTitle,
        supervisor: group.supervisorId,
        students: Array.from(project.students).map(student => ({
          studentId: student.userId,
          name: student.name,
          rollNo: student.rollNo
        })),
        vivaDate: new Date(parsedDate),
        vivaTime: vivaTime
      });
      group.viva = viva._id;
      group.vivaDate = new Date(parsedDate);

      await Promise.all([group.save(), viva.save()]);
      console.log('Viva is ', viva)
      // Send notification to group users and supervisors about the scheduled viva
      const notificationMessage = `A viva has been scheduled for the project "${project.projectTitle}" on ${vivaDate}`;

      // Send notifications to students
      project.students.forEach(async (student) => {
        const user = await User.findById(student.userId);
        if (user) {
          user.unseenNotifications.push({ type:"Reminder", message: notificationMessage });
          user.vivaTime = vivaTime;
          user.vivaDate = parsedDate;
          user.viva = viva._id;
          await user.save();
        }
      });

      // Send notification to supervisor
      const supervisor = await Supervisor.findById(group.supervisor._id);
      console.log('Super visor is ', supervisor)
      if (supervisor) {
        supervisor.unseenNotifications.push({ message: notificationMessage });
        await supervisor.save();
      }
    });

    res.json({ success: true, message: 'Viva scheduled and notifications sent' });

  } catch (err) {
    console.error('Error scheduling viva:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// To get scheduled viva
router.get('/vivas', async (req, res) => {
  try {
    const vivas = await Viva.find();
    if (!vivas || vivas.length === 0) {
      return res.status(500).json({ success: false, message: 'Vivas not found' });
    }

    // Use Promise.all to wait for all asynchronous operations
    const vivaPromises = vivas.map(async (viva) => {
      const group = await Group.findById(viva.group);
      if (!group) {
        return res.status(500).json({ success: false, message: 'Group not found' });
      }
      // Add isProps and isDoc to the viva object
      return {
        ...viva.toObject(), // Convert Mongoose document to plain object
        documentation: {
          isProps: group.isProp,
          isDoc: group.isDoc
        }
      };
    });

    // Wait for all promises to resolve
    const vivaResults = await Promise.all(vivaPromises);

    res.json({ success: true, message: 'Viva fetched successfully', vivas: vivaResults });

  } catch (error) {
    console.error('Error fetching scheduled vivas ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//get my detail
router.get('/detail', authenticateUser, async (req, res) => {
  try {
    const studentId = req.user.id; // Get the authenticated user's ID from the token payload

    const student = await Committee.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Member not found' });
    }
    // Return the student details
    return res.json(student);
  } catch (error) {
    console.error('error is ', error)
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/dueDate', async (req, res) => {
  try {
    const { projectTitle, dueDate } = req.body;
    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    });
    if (!group) {
      return res.status(500).json({ success: false, message: 'Group not found' });
    }
    // Parse the date in "DD-MM-YYYY" format and convert it to ISO format
    const isoDueDate = moment(dueDate, 'DD-MM-YYYY').toISOString();

    group.propDate = isoDueDate;

    for (const grp of group.projects) {
      console.log('projects is ', grp);
      for (const studentId of grp.students) {
        const stu = await User.findById(studentId.userId);
        if (!stu) {
          return res.status(500).json({ success: false, message: 'Student not found' });
        }
        console.log('Student is ', stu);
        stu.propDate = isoDueDate;
        await stu.save();
      }
    }

    await group.save();
    return res.json({ success: true, message: 'Due Date is added' });

  } catch (error) {
    console.error('error is ', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/edit', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime } = req.body;
    // Use findOneAndUpdate to find and update the document
    const updatedViva = await Viva.findOneAndUpdate(
      { projectTitle: projectTitle },
      { vivaDate: vivaDate, vivaTime: vivaTime },
      { new: true }
    );
    
    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    group.vivaDate = vivaDate;
    await group.save();

    group.projects.map(proj=>{
      proj.students.map(async stu=>{
        const student = await User.findById(stu.userId);
        if(!student){
          return;
        }
        student.vivaDate = vivaDate;
        student.unseenNotifications.push({
          type : "Important",
          message : `Viva Date has been changed by the Committee 
          It's now ${vivaDate} at ${vivaTime}
          `
        });
        student.vivaTime = vivaTime;  
        await student.save();
      })
    })

    // Send the updated document as the response
    res.json({ success: true, message: "Viva Updated Successfully", updatedViva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;