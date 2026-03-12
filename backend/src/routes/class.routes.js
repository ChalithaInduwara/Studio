'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllClasses, createClass, getClassById, updateClass, deleteClass,
    enrollInClass, getClassStudents,
} = require('../controllers/class.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isTutor } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getAllClasses);
router.post('/', isTutor, createClass);
router.get('/:id', getClassById);
router.put('/:id', isTutor, updateClass);
router.delete('/:id', isAdmin, deleteClass);
router.post('/:id/enroll', enrollInClass);
router.get('/:id/students', isTutor, getClassStudents);

module.exports = router;
