'use strict';

const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based access control (RBAC) middleware factory.
 *
 * Returns an Express middleware that only allows through requests
 * where `req.user.role` is one of the permitted roles.
 *
 * Must be used AFTER the `protect` middleware.
 *
 * Example usage:
 *   router.delete('/users/:id', protect, authorize('admin'), deleteUser);
 *
 * @param {...string} roles — allowed roles, e.g. 'admin', 'tutor'
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 'Not authenticated.', 401);
    }
    if (!roles.includes(req.user.role)) {
        return errorResponse(
            res,
            `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
            403
        );
    }
    next();
};

// ── Convenient named guards ────────────────────────────────────────────────
const isAdmin = authorize('admin');
const isTutor = authorize('admin', 'tutor');
const isStudent = authorize('admin', 'tutor', 'student');
const isClient = authorize('admin', 'client');

module.exports = { authorize, isAdmin, isTutor, isStudent, isClient };
