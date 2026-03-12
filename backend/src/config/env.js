'use strict';

/**
 * Centralised environment variable configuration.
 *
 * Import from this file instead of accessing `process.env` directly
 * elsewhere in the codebase.  This makes it trivial to see every
 * required env var in one place and add validation / defaults.
 */

const requiredVars = ['MONGO_URI', 'JWT_SECRET'];

requiredVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
