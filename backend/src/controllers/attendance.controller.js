'use strict';

const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * POST /api/v1/attendance
 * Body: { classId, sessionDate, records: [{ studentId, status, notes }] }
 * Mark attendance for an entire session at once.
 */
const markAttendance = asyncHandler(async (req, res) => {
    const { classId, sessionDate, records } = req.body;
    const attendance = await attendanceService.markAttendance({
        classId, sessionDate, records, markedBy: req.user._id,
    });
    return successResponse(res, attendance, 'Attendance marked', 201);
});

/**
 * GET /api/v1/attendance/class/:classId?sessionDate=YYYY-MM-DD
 */
const getSessionAttendance = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { sessionDate } = req.query;
    const attendance = await attendanceService.getSessionAttendance(classId, sessionDate || new Date());
    return successResponse(res, attendance, 'Session attendance retrieved');
});

/**
 * GET /api/v1/attendance/student/:studentId?classId=...
 */
const getStudentAttendance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { classId } = req.query;
    const attendance = await attendanceService.getStudentAttendance(studentId, classId);
    return successResponse(res, attendance, 'Student attendance retrieved');
});

/**
 * GET /api/v1/attendance/summary/:classId
 */
const getAttendanceSummary = asyncHandler(async (req, res) => {
    const summary = await attendanceService.getAttendanceSummary(req.params.classId);
    return successResponse(res, summary, 'Attendance summary retrieved');
});

module.exports = { markAttendance, getSessionAttendance, getStudentAttendance, getAttendanceSummary };
