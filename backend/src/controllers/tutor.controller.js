'use strict';

const User = require('../models/User.model');
const Class = require('../models/Class.model');
const Booking = require('../models/Booking.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/v1/tutors
 * List all active tutors.
 */
const getAllTutors = asyncHandler(async (req, res) => {
    const tutors = await User.find({ role: 'tutor', isActive: true })
        .select('name email phone')
        .sort({ name: 1 });
    return successResponse(res, tutors, 'Tutors retrieved');
});

/**
 * GET /api/v1/tutors/:id/classes
 * All classes assigned to a tutor.
 */
const getTutorClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find({ tutorId: req.params.id, isActive: true })
        .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });
    return successResponse(res, classes, 'Tutor classes retrieved');
});

/**
 * GET /api/v1/tutors/:id/schedule
 * Weekly schedule for a tutor (grouped by day).
 */
const getTutorSchedule = asyncHandler(async (req, res) => {
    const classes = await Class.find({ tutorId: req.params.id, isActive: true })
        .select('className schedule isRecurring capacity enrolledCount onlineLink')
        .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });

    // Group by day of week
    const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};
    DAY_ORDER.forEach(d => (schedule[d] = []));
    classes.forEach(c => {
        if (c.schedule?.day) schedule[c.schedule.day].push(c);
    });

    return successResponse(res, schedule, 'Tutor weekly schedule retrieved');
});

module.exports = { getAllTutors, getTutorClasses, getTutorSchedule };
