'use strict';

const mongoose = require('mongoose');

/**
 * Studio Schema
 *
 * Represents a recordable/rentable studio room (Sasitha Audio Production).
 */
const studioSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Studio name is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        hourlyRate: {
            type: Number,
            required: [true, 'Hourly rate is required'],
            min: [0, 'Hourly rate cannot be negative'],
        },
        // Available hours per day (e.g. "08:00"–"22:00")
        openTime: { type: String, default: '08:00' },
        closeTime: { type: String, default: '22:00' },
        amenities: [{ type: String }],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Studio = mongoose.model('Studio', studioSchema);

module.exports = Studio;
