'use strict';

const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getSessionAttendance,
    getStudentAttendance,
    getAttendanceSummary,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { isTutor, isAdmin } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', isTutor, markAttendance);
router.get('/class/:classId', isTutor, getSessionAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/summary/:classId', isTutor, getAttendanceSummary);

module.exports = router;
