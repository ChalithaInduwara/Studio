'use strict';

const { NODE_ENV } = require('../config/env');

/**
 * 404 — No route matched handler.
 * Must be placed AFTER all route declarations.
 */
const notFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

/**
 * Global error handler.
 * Must be declared with 4 arguments so Express recognises it as an error handler.
 * Must be the LAST middleware registered in app.js.
 *
 * @param {Error} err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function} next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for field: ${err.path}`;
    }

    // ── Mongoose duplicate key error ────────────────────────────────────────
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate value: ${field} already exists.`;
    }

    // ── Mongoose validation error ───────────────────────────────────────────
    if (err.name === 'ValidationError') {
        statusCode = 422;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    // ── JWT errors ──────────────────────────────────────────────────────────
    if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token.'; }
    if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired.'; }

    // ── Send response ───────────────────────────────────────────────────────
    res.status(statusCode).json({
        success: false,
        message,
        // Include stack trace only in development
        ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
