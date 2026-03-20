'use strict';

const express = require('express');
const router = express.Router();
const { sendSupportRequest } = require('../controllers/support.controller');
const { protect } = require('../middleware/auth.middleware');

// All support routes are protected
router.use(protect);

/**
 * POST /api/v1/support
 * Send a support request to the admin
 */
router.post('/', sendSupportRequest);

module.exports = router;
