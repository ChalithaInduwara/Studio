'use strict';

const { validationResult, body } = require('express-validator');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─── Validation rules ──────────────────────────────────────────────────────
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['student', 'client', 'tutor', 'admin'])
        .withMessage('Role must be student, client, tutor, or admin'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

// ─── Helper ────────────────────────────────────────────────────────────────
const validate = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errorResponse(res, 'Validation failed', 422, errors.array());
        return false;
    }
    return true;
};

// ─── Controllers ───────────────────────────────────────────────────────────

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = [
    ...registerValidation,
    asyncHandler(async (req, res) => {
        if (!validate(req, res)) return;

        const { name, email, password, role } = req.body;
        const { user, token } = await authService.register({ name, email, password, role });

        return successResponse(res, { user, token }, 'Registration successful', 201);
    }),
];

/**
 * @desc    Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = [
    ...loginValidation,
    asyncHandler(async (req, res) => {
        if (!validate(req, res)) return;

        const { email, password } = req.body;
        const { user, token } = await authService.login({ email, password });

        return successResponse(res, { user, token }, 'Login successful');
    }),
];

/**
 * @desc    Logout (JWT is stateless; simply acknowledge, client discards token)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    return successResponse(res, null, 'Logged out successfully');
});

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by protect middleware (full document)
    return successResponse(res, req.user, 'User profile retrieved');
});

module.exports = { register, login, logout, getMe };
