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
    const supervisor = await Supervisor.findById(req.user.id);

    if(!supervisor){
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    if(!supervisor._id.equals(group.supervisorId)){
      return res.status(404).json({ message: 'Group doesnot belong to you' });
    }

    const parsedDate = moment(date, 'YYYY-MM-DD').toDate();


    // Check if parsedDate is a valid date
    if (!moment(parsedDate).isValid()) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const meeting = new Meeting({
      projectTitle: projectTitle, supervisor: group.supervisor,
      supervisorId: group.supervisorId, meetingLink: meetingLink,
      purpose: purpose, time: time, date: parsedDate, type: type
    });
    await meeting.save();

    const check = await Meeting.findById(meeting._id);
    if (!check) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const studentIds = group.projects.flatMap(proj => proj.students.map(student => student.userId));

    // Send notifications to students
    const messageToStudents = `Meeting Scheduled for ${projectTitle} on ${date} at ${time} by ${supervisor.name}`;
    await Promise.all(studentIds.map(async (studentId) => {
      const student = await User.findById(studentId);
      if (student) {
        student.meetingId = meeting._id; student.meetingLink = meetingLink;
        student.meetingTime = time; student.meetingDate = parsedDate;
        student.unseenNotifications.push({ type: 'Reminder', message: messageToStudents });
        await student.save();
      }
    }));

    // Send a notification to the supervisorsupervisor.meetingId = meeting._id;
    supervisor.meeting.push(meeting._id);

    const messageToSupervisor = `You scheduled a meeting with group ${projectTitle}`;
    supervisor.unseenNotifications.push({ type: 'Reminder', message: messageToSupervisor });
    await supervisor.save();

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a meeting by ID
router.put('/edit-meeting/:id', async (req, res) => {
  const { id } = req.params;
  const updatedMeetingData = req.body;

  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(id, updatedMeetingData, {
      new: true, // Return the updated meeting
    });

    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const group = await Group.findOne({'projects.projectTitle' : updatedMeeting.projectTitle});
    if(!group){
      return;
    }
    group.projects[0].students.map( async stu=>{
      const studentObj = await User.findById(stu.userId);
      if(studentObj){
        studentObj.unseenNotifications.push({
          type : "Important", message : "You're Meeting Time has been updated "
        });
        await studentObj.save();
      }
    })

    return res.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/get-meeting', authenticateUser, async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.user.id);
    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not Found' });
    }

    const meetingPromises = supervisor.meeting.map(async (id) => {
      console.log('meeting id is ', id);
      const meet = await Meeting.findById(id);
      if (!meet) {
        console.log('not found');
        return null; // Return null for meetings that are not found
      }
      return {
        meetingId: meet._id, meetingGroup: meet.projectTitle,
        meetingTime: meet.time, meetingDate: meet.date,
        meetingLink: meet.meetingLink,
      };
    });

    // Use Promise.all to await all the promises
    const meetingData = await Promise.all(meetingPromises);

    // Remove null entries (meetings that were not found)
    const validMeetings = meetingData.filter((meeting) => meeting !== null);

    return res.json({ success: true, meeting: validMeetings });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a meeting by ID
router.delete('/delete-meeting/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(id);

    const group = await Group.findOne({'projects.projectTitle' : deletedMeeting.projectTitle});
    if(group){
      group.projects[0].students.map( async stu=>{
        const studentObj = await User.findById(stu.userId);
        if(studentObj){
          studentObj.unseenNotifications.push({
            type : "Important", message : "You're Meeting Time has been Cancelled "
          });
          await studentObj.save();
        }
      });
    }

    if (!deletedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }


    return res.json({ success: true, message: 'Meeting Cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;