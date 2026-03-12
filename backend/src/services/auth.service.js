'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Sign a JWT for a given user id and role.
 * @param {object} payload - { id, role }
 * @returns {string} signed token
 */
const signToken = (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ─── Register ─────────────────────────────────────────────────────────────
/**
 * Create a new user and return a signed JWT.
 * @param {{ name, email, password, role }} data
 * @returns {{ user: object, token: string }}
 */
const register = async ({ name, email, password, role }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Email already in use.');
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({ name, email, password, role: role || 'student' });
    const token = signToken({ id: user._id, role: user.role });

    return { user, token };
};

// ─── Login ─────────────────────────────────────────────────────────────────
/**
 * Authenticate with email + password and return a signed JWT.
 * @param {{ email, password }} credentials
 * @returns {{ user: object, token: string }}
 */
const login = async ({ email, password }) => {
    // select: false on password means we must explicitly request it
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        const err = new Error('Invalid email or password.');
        err.statusCode = 401;
        throw err;
    }

    if (!user.isActive) {
        const err = new Error('Your account has been deactivated. Please contact an administrator.');
        err.statusCode = 403;
        throw err;
    }

    const token = signToken({ id: user._id, role: user.role });
    return { user, token };
};

module.exports = { register, login, signToken };
