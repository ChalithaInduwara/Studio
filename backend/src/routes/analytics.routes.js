'use strict';

const express = require('express');
const router = express.Router();
const { getBookingAnalytics, getClassAnalytics, getRevenueAnalytics, getOverview } =
    require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.use(protect, isAdmin);

router.get('/overview', getOverview);
router.get('/bookings', getBookingAnalytics);
router.get('/classes', getClassAnalytics);
router.get('/revenue', getRevenueAnalytics);

module.exports = router;
