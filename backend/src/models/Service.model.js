'use strict';

const mongoose = require('mongoose');

/**
 * Service Schema — studio services offered (S3-02)
 * e.g. "Recording Session", "Mixing", "Mastering"
 */
const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
            unique: true,
        },
        description: { type: String, trim: true },
        price: { type: Number, default: 0, min: 0 },
        unit: { type: String, default: 'per hour' }, // "per hour", "flat rate", etc.
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
