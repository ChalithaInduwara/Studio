'use strict';

const Enrollment = require('../models/Enrollment.model');
const Class = require('../models/Class.model');

/**
 * Get recent activities relevant to a specific tutor.
 * Activities include: new enrollments, attendance marks, etc.
 */
const getTutorActivities = async (tutorId) => {
    // 1. Get all classes assigned to this tutor
    const myClasses = await Class.find({ tutorId }).select('_id className');
    const classIds = myClasses.map(c => c._id);

    // 2. Get recent enrollments for these classes
    const recentEnrollments = await Enrollment.find({
        classId: { $in: classIds },
    })
        .populate('studentId', 'name')
        .populate('classId', 'className')
        .sort({ createdAt: -1 })
        .limit(10);

    // 3. Map to a unified activity format
    return recentEnrollments.map(enrol => ({
        id: enrol._id,
        type: 'enrollment',
        studentName: enrol.studentId?.name || 'New Student',
        className: enrol.classId?.className || 'Class',
        status: enrol.status,
        timestamp: enrol.createdAt,
    }));
};

module.exports = { getTutorActivities };
