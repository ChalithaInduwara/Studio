'use strict';

const mongoose = require('mongoose');

/**
 * Attendance Schema — tracks per-class, per-student, per-session attendance.
 */
const attendanceSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Class ID is required'],
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student ID is required'],
        },
        // The specific session date (for recurring classes, each session is a record)
        sessionDate: {
            type: Date,
            required: [true, 'Session date is required'],
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'absent',
        },
        notes: { type: String, trim: true },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // tutor or admin who recorded the attendance
        },
    },
    { timestamps: true }
);

// Prevent duplicate attendance records per student/class/session
attendanceSchema.index({ classId: 1, studentId: 1, sessionDate: 1 }, { unique: true });

// Fast lookups by class + session
attendanceSchema.index({ classId: 1, sessionDate: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
