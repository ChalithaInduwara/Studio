'use strict';

/**
 * Standardised API response helpers.
 *
 * Use these in every controller so the frontend always
 * receives a consistent JSON envelope.
 *
 * Success shape:
 *   { success: true, message, data }
 *
 * Error shape:
 *   { success: false, message, errors? }
 */

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {*}      data     — payload to include
 * @param {string} message  — human-readable message
 * @param {number} [statusCode=200]
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {string}   message
 * @param {number}   [statusCode=500]
 * @param {Array}    [errors=[]]   — optional validation error details
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
    const body = {
        success: false,
        message,
    };
    if (errors.length > 0) body.errors = errors;
    res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
