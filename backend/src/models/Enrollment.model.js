'use strict';

const mongoose = require('mongoose');

/**
 * Enrollment Schema
 *
 * Join table between Student (User) and Class.
 * Tracks which students are enrolled in which classes.
 */
const enrollmentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class ID is required'],
        },
        enrollmentDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'dropped', 'completed'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// ── Prevent duplicate enrollments ──────────────────────────────────────────
enrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
