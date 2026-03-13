'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllClasses, getMyClasses, createClass, getClassById, updateClass, deleteClass,
    enrollInClass, approveEnrollment, rejectEnrollment, getPendingRequests, getMyEnrollments, getClassStudents,
} = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isTutor } = require('../middleware/role.middleware');

router.use(protect);

// ── Static / specific routes MUST come BEFORE /:id ──────────────────────────
// (Express matches routes top to bottom; if /:id comes first, 'me',
//  'pending-requests', 'my' etc. will be captured as IDs)

router.get('/', getAllClasses);
router.post('/', isTutor, createClass);

router.get('/me', isTutor, getMyClasses);               // tutor's own classes
router.get('/pending-requests', isAdmin, getPendingRequests);
router.get('/my/enrollments', getMyEnrollments);         // student's enrollments
router.patch('/enrollments/:id/approve', isAdmin, approveEnrollment);
router.patch('/enrollments/:id/reject', isAdmin, rejectEnrollment);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.get('/:id', getClassById);
router.put('/:id', isTutor, updateClass);
router.delete('/:id', isAdmin, deleteClass);
router.post('/:id/enroll', enrollInClass);
router.get('/:id/students', isTutor, getClassStudents);

module.exports = router;
