const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Allocation = require('../models/Allocation');

router.get('/list', async (req, res) => {
    try {
        const list = await Allocation.find();
        if (!list) {
            return res.json({ message: "No Group Allocated Yet" });
        }
        return res.json({ success: true, list })
    } catch (error) {
        console.error('error getting allocation list', error);
        res.json({ message: "Internal Server Error" })
    }
});

module.exports = router;