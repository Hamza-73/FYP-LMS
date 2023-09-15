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
const ProjectRequest = require('../../models/ProjectRequest/ProjectRequest');
const Meeting = require('../../models/Meeting');
const moment = require('moment');

router.post('/meeting', authenticateUser, async (req, res) => {
  try {
    const { meetingLink, projectTitle, date, time, type, purpose } = req.body;

    // Check if a meeting with the same projectTitle and future meeting time exists
    const existingMeeting = await Meeting.findOne({
      projectTitle: projectTitle,
      date: { $gte: new Date() }, // Check for meetings with a date greater than or equal to the current date
    });

    if (existingMeeting) {
      return res.status(400).json({ message: `Meeting with ${projectTitle} already scheduled` });
    }

    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    console.log('reuest date s ', date)
    const parsedDate = moment(date, 'YYYY-MM-DD').toDate();
    console.log('parsed date is ', parsedDate)

    // Check if parsedDate is a valid date
    if (!moment(parsedDate).isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const meeting = new Meeting({
      projectTitle: projectTitle,
      supervisor: group.supervisor,
      supervisorId: group.supervisorId,
      meetingLink: meetingLink,
      purpose: purpose,
      time: time,
      date: parsedDate,
      type: type
    });
    await meeting.save();

    const check = await Meeting.findById(meeting._id);
    if (!check) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const studentIds = group.projects.flatMap(proj => proj.students.map(student => student.userId));
    const supervisor = await Supervisor.findById(req.user.id);
    const user = await User.findById(req.user.id);

    // Check if the current user is a supervisor or a student
    if (supervisor) {
      // Send notifications to students
      const messageToStudents = `Meeting Scheduled for ${projectTitle} on ${date} at ${time} by ${supervisor.name}`;
      await Promise.all(studentIds.map(async (studentId) => {
        const student = await User.findById(studentId);
        if (student) {
          student.meetingId = meeting._id;
          student.meetingLink = meetingLink;
          student.meetingTime = time;
          student.meetingDate = parsedDate;
          student.unseenNotifications.push({ type: 'Reminder', message: messageToStudents });
          await student.save();
        }
      }));

      // Send a notification to the supervisorsupervisor.meetingId = meeting._id;
      supervisor.meetingLink = meetingLink;
      supervisor.meetingTime = time;
      supervisor.meetingDate = parsedDate;
      const messageToSupervisor = `You scheduled a meeting with group ${projectTitle}`;
      supervisor.unseenNotifications.push({ type: 'Reminder', message: messageToSupervisor });
      await supervisor.save();
    } else if (user) {
      // Send notifications to other group members
      const messageToGroupMembers = `Meeting Scheduled for ${projectTitle} on ${date} at ${time}`;
      await Promise.all(studentIds.map(async (studentId) => {
          const student = await User.findById(studentId);
          if (student) {
            student.meetingId = meeting._id,
            student.meetingLink = meetingLink;
            student.meetingTime = time;
            student.meetingDate = parsedDate;
            student.unseenNotifications.push({ type: 'Reminder', message: messageToGroupMembers });
            await student.save();
        }
      }));
      const sup = await Supervisor.findById(group.supervisorId);
      if (!sup) {
        return;
      }
      // Send a notification to the supervisor
      const messageToSupervisor = `${user.name} scheduled a meeting for group ${projectTitle}`;
      sup.unseenNotifications.push({ type: 'Reminder', message: messageToSupervisor });
      await sup.save();
    }

    // Update group and supervisor
    group.meetingLink = meetingLink;
    group.meetingid = meeting._id;
    const meetingReport = {
      meetingTitle: projectTitle, // You can use the projectTitle as the meeting title
      date: parsedDate,
      time: time,
      type: type,
      purpose: purpose,
    };
    group.meetingReport.push(meetingReport);
    await Promise.all([group.save()]);

    return res.json({ success: true, message: `Meeting Scheduled with group of ${projectTitle}` });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;