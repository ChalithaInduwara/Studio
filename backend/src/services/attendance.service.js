'use strict';

const Attendance = require('../models/Attendance.model');
const Enrollment = require('../models/Enrollment.model');

const markAttendance = async ({ classId, sessionDate, records, markedBy }) => {
    // records = [{ studentId, status, notes }]
    const ops = records.map(({ studentId, status, notes }) => ({
        updateOne: {
            filter: { classId, studentId, sessionDate: new Date(sessionDate) },
            update: { $set: { status, notes, markedBy } },
            upsert: true,
        },
    }));
    await Attendance.bulkWrite(ops);
    return getSessionAttendance(classId, sessionDate);
};

const getSessionAttendance = async (classId, sessionDate) => {
    const day = new Date(sessionDate);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day); next.setDate(day.getDate() + 1);

    return Attendance.find({ classId, sessionDate: { $gte: day, $lt: next } })
        .populate('studentId', 'name email')
        .populate('markedBy', 'name');
};

const getStudentAttendance = async (studentId, classId) => {
    const filter = { studentId };
    if (classId) filter.classId = classId;
    return Attendance.find(filter)
        .populate('classId', 'className')
        .sort({ sessionDate: -1 });
};

const getAttendanceSummary = async (classId) => {
    const totalEnrolled = await Enrollment.countDocuments({ classId, status: 'active' });
    const stats = await Attendance.aggregate([
        { $match: { classId: require('mongoose').Types.ObjectId.createFromHexString(classId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return { classId, totalEnrolled, stats };
};

module.exports = { markAttendance, getSessionAttendance, getStudentAttendance, getAttendanceSummary };
