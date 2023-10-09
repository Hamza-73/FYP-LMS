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
const moment = require('moment');
const External = require('../../models/External');


// Schedule a viva for a specific group's project
router.post('/schedule-viva', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime, external, internal } = req.body;
    console.log('external is ', external)
    console.log('internal is ', internal)

    if (new Date(vivaDate) < new Date()) {
      return res.json({ success: false, message: "Enter a valid date" })
    }
    // Find the group by project title
    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    console.log('Group is ', group.projects[0].projectTitle)
    if (!(group.documentation && group.proposal)) {
      return res.status(500).json({ success: false, message: `Documentation or Proposal is Pending` })
    }

    const externalMember = await External.findOne({ username: external });
    if (!externalMember) {
      return res.status(404).json({ success: false, message: 'External Member not found' });
    }

    const parsedDate = moment(vivaDate, 'DD-MM-YYYY').toDate();

    const internalMember = await Supervisor.findOne({ username: internal })
    if (!internalMember) {
      return res.status(404).json({ success: false, message: 'Internal Member not found' });
    }

    if (group.supervisorId.equals(internalMember._id)) {
      return res.json({ success: false, message: `${internal} is the supervisor of this group so select another internal member for this group` });
    }

    externalMember.groups.forEach(grp => {
      let count = 0;
      if (new Date(grp.date) === parsedDate) {
        count += 1;
      } if (count >= 2) {
        return res.json({ success: false, message: "External Member Already have 2 Vivas Schduled on this Date" });
      }
    });

    internalMember.groups.forEach(grp => {
      let count = 0;
      if (new Date(grp.date) === parsedDate) {
        count += 1;
      } if (count >= 2) {
        return res.json({ success: false, message: "Internal Member Already have 2 Vivas Schduled on this Date" });
      }
    });

    externalMember.groups.push({
      id: group._id,
      name: projectTitle,
      date: parsedDate
    });
    console.log('external save');

    internalMember.vivas.push({
      id: group._id,
      name: projectTitle,
      date: parsedDate
    });
    console.log('internal save 1');
    internalMember.unseenNotifications.push({
      type: "Important", message: `You have a viva scheduled with ${projectTitle} on ${parsedDate}`
    })
    console.log('internal save notidication');
    await Promise.all([internalMember.save(), externalMember.save()])
    console.log('internal save 1');
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
        vivaDate: new Date(parsedDate), vivaTime: vivaTime,
        external: external, internal: internal
      });
      group.viva = viva._id;
      group.vivaDate = new Date(parsedDate);
      group.external = external;
      group.vivaTime = vivaTime;
      group.internal = internal;
      console.log('viva created')
      await Promise.all([group.save(), viva.save()]);
      console.log('Viva is ', viva)
      // Send notification to group users and supervisors about the scheduled viva
      const notificationMessage = `A viva has been scheduled for the project "${projectTitle}" on ${vivaDate}`;

      // Send notifications to students
      project.students.forEach(async (student) => {
        const user = await User.findById(student.userId);
        if (user) {
          user.unseenNotifications.push({ type: "Reminder", message: notificationMessage });
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
        supervisor.unseenNotifications.push({ type: "Reminder", message: notificationMessage });
        await supervisor.save();
      }
    });

    res.json({ success: true, message: 'Viva scheduled and notifications sent' });

  } catch (err) {
    console.error('Error scheduling viva:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/edit', async (req, res) => {
  try {
    const { projectTitle, vivaDate, vivaTime, external, internal } = req.body;
    // Use findOneAndUpdate to find and update the document
    const updatedViva = await Viva.findOneAndUpdate(
      { projectTitle: projectTitle },
      { vivaDate: vivaDate, vivaTime: vivaTime },
      { new: true }
    );

    if (new Date(vivaDate) < new Date()) {
      return res.json({ success: false, message: "Enter a valid date" })
    }

    const group = await Group.findOne({
      'projects.projectTitle': projectTitle
    }).populate('supervisor projects.students');

    if (external && !group.internal === external) {
      const externalMember = await External.findOne({ username: external });
      if (!externalMember) {
        return res.status(404).json({ success: false, message: 'External Member not found' });
      }

      externalMember.groups.push({
        id: group._id,
        name: projectTitle, date: parsedDate
      });

      externalMember.groups.forEach(grp => {
        let count = 0;
        if (new Date(grp.date) === parsedDate) {
          count += 1;
        } if (count >= 2) {
          return res.json({ success: false, message: "External Member Already have 2 Vivas Schduled on this Date" });
        }
      });
      await externalMember.save()
    }

    const parsedDate = moment(vivaDate, 'DD-MM-YYYY').toDate();
    if (internal && !group.internal === internal) {
      const internalMember = await Supervisor.findOne({ username: internal })
      if (!internalMember) {
        return res.status(404).json({ success: false, message: 'Internal Member not found' });
      }

      if (group.supervisorId.equals(internalMember._id)) {
        return res.json({ success: false, message: `${internal} is the supervisor of this group so select another internal member for this group` });
      }

      internalMember.groups.forEach(grp => {
        let count = 0;
        if (new Date(grp.date) === parsedDate) {
          count += 1;
        } if (count >= 2) {
          return res.json({ success: false, message: "Internal Member Already have 2 Vivas Schduled on this Date" });
        }
      });

      console.log('external save');

      internalMember.vivas.push({
        id: group._id,
        name: projectTitle,
        date: parsedDate
      });
      console.log('internal save 1');
      internalMember.unseenNotifications.push({
        type: "Important", message: `You have a viva scheduled with ${projectTitle} on ${parsedDate}`
      })
      console.log('internal save notidication');
      await internalMember.save()
    }
    updatedViva.external = external;
    updatedViva.internal = internal;
    await updatedViva.save();
    group.vivaDate = vivaDate; group.vivaTime = vivaTime;
    group.external = external; group.internal = internal;
    await group.save();

    group.projects.map(proj => {
      proj.students.map(async stu => {
        const student = await User.findById(stu.userId);
        if (!student) {
          return;
        }
        student.vivaDate = vivaDate;
        student.unseenNotifications.push({
          type: "Important",
          message: `Viva Date has been changed by the Committee 
          It's now ${vivaDate} at ${vivaTime}
          `
        });
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
          proposal: group.proposal,
          documentation: group.documentation,
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

module.exports = router;