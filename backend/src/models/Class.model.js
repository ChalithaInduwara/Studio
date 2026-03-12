'use strict';

const mongoose = require('mongoose');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Class Schema
 *
 * Represents a music academy class at Swara Academy.
 * Supports both one-off and recurring sessions.
 */
const classSchema = new mongoose.Schema(
    {
        className: {
            type: String,
            required: [true, 'Class name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        tutorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Tutor ID is required'],
        },
        // Schedule sub-document
        schedule: {
            day: { type: String, enum: DAYS },
            startTime: { type: String, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'] },
            endTime: { type: String, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'] },
            startDate: { type: Date },
            endDate: { type: Date },
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        capacity: {
            type: Number,
            default: 10,
            min: [1, 'Capacity must be at least 1'],
        },
        // Enrolled student count — denormalised for performance
        enrolledCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Online class link — Zoom / Google Meet / Teams (S2-06)
        onlineLink: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// ── Index for conflict-detection (tutor schedule overlap) ──────────────────
classSchema.index({ tutorId: 1, 'schedule.day': 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
