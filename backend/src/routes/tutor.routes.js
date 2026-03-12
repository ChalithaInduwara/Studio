'use strict';

const express = require('express');
const router = express.Router();
const { getAllTutors, getTutorClasses, getTutorSchedule } =
    require('../controllers/tutor.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAllTutors);
router.get('/:id/classes', getTutorClasses);
router.get('/:id/schedule', getTutorSchedule);

module.exports = router;
