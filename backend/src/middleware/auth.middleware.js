'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET } = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes — verifies the Bearer JWT from the Authorization header.
 * Also confirms the user still exists in the DB and is still active.
 */
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'No token provided. Access denied.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Confirm user still exists & is active (catches deleted/deactivated accounts)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return errorResponse(res, 'The user belonging to this token no longer exists.', 401);
        }
        if (!user.isActive) {
            return errorResponse(res, 'Your account has been deactivated.', 403);
        }

        req.user = user; // full user doc attached
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token has expired. Please log in again.', 401);
        }
        return errorResponse(res, 'Token is invalid.', 401);
    }
};

module.exports = { protect };
