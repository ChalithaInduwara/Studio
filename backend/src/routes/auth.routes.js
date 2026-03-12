'use strict';

const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

// POST /api/v1/auth/logout
router.post('/logout', protect, logout);

// GET  /api/v1/auth/me — get current authenticated user
router.get('/me', protect, getMe);

module.exports = router;
