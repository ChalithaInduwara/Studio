'use strict';

const mongoose = require('mongoose');

const BOOKING_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];

/**
 * Booking Schema
 *
 * Represents a studio booking request from a client.
 * The Conflict Detection Engine will query this collection
 * using: proposedStart < existingEnd && proposedEnd > existingStart
 */
const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        studioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Studio',
            required: [true, 'Studio ID is required'],
        },
        // A human-readable description of the service booked (e.g. "Recording Session")
        serviceType: {
            type: String,
            trim: true,
            default: 'General',
        },
        date: {
            type: Date,
            required: [true, 'Booking date is required'],
        },
        // Store times as ISO strings (HH:mm) for easy querying
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm format'],
        },
        status: {
            type: String,
            enum: BOOKING_STATUS,
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// ── Index for conflict-detection queries ───────────────────────────────────
bookingSchema.index({ studioId: 1, date: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
