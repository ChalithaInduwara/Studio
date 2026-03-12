'use strict';

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

/**
 * Establishes the Mongoose connection to MongoDB.
 * Called once at server startup from server.js.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            // These options are the recommended safe defaults for Mongoose 8+
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌  MongoDB connection error: ${error.message}`);
        throw error; // re-throw so server.js can exit
    }
};

// ── Connection event listeners ─────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄  MongoDB reconnected.');
});

module.exports = { connectDB };
