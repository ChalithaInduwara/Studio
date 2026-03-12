'use strict';

/**
 * Wraps an async Express route handler so you don't need a try/catch
 * in every controller.  Any rejected promise is forwarded to next()
 * and caught by the global error middleware.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn — async controller function
 * @returns {Function} — Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
