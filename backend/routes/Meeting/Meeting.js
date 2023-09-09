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
const moment = require('moment')
router.post('/meeting', async (req, res) => {
    try {
      const { meetingLink, projectTitle, date, time, type, purpose } = req.body;
      const group = await Group.findOne({
        'projects.projectTitle': projectTitle
      }).populate('supervisor projects.students');
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      const parsedDate = moment(date, 'DD-MM-YYYY').toDate();
  
      // Check if parsedDate is a valid date
      if (!moment(parsedDate).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
  
      console.log('group is ', group);
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
      console.log('meeting is ', meeting);
  
      const check = await Meeting.findById(meeting._id);
      if (!check) {
        return res.status(404).json({ message: 'Meeting not found' });
      }
      
      console.log('check is ', check);
  
      const student = group.projects.map(proj => {
        return proj.students.map(student => student.userId);
      });
  
      console.log('students are ', student);
  
      const supervisor = await Supervisor.findById(group.supervisorId);
      if (!supervisor) {
        return res.status(404).json({ message: 'Supervisor not found' });
      }
  
      console.log('supervisor is ', supervisor);
  
      student.map(async students => {
        const stu = await User.findById(students);
        if (!stu) {
          return res.status(404).json({ message: 'Student not found' });
        }
        const message = `You're Meeting Scheduled for ${projectTitle} on ${date} at ${time} by ${group.supervisor}`;
        stu.meetingId = meeting._id;
        stu.meetingLink = meetingLink;
        stu.unseenNotifications.push({ type: "Reminder", message: message });
        await stu.save();
      });
  
      group.meetingLink = meetingLink;
      group.meetingid = meeting._id;
      const message = `You're Meeting Scheduled for ${projectTitle} on ${date} at ${time}`;
      supervisor.unseenNotifications.push({ type: "Reminder", message: message });
      await Promise.all([group.save(), supervisor.save()]);
  
      return res.json({ success: true, message: `Meeting Scheduled with group of ${projectTitle}` });
  
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
module.exports = router;