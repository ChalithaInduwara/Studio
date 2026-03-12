'use strict';

const mongoose = require('mongoose');

/**
 * Material Schema — project files and learning materials (S3-03 + S3-04)
 */
const materialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: { type: String, trim: true },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
        },
        fileName: { type: String },
        fileSize: { type: Number }, // bytes
        mimeType: { type: String },
        materialType: {
            type: String,
            enum: ['learning', 'project'],
            default: 'learning',
        },
        // Either a class or a booking can own a material
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

materialSchema.index({ classId: 1, materialType: 1 });
materialSchema.index({ bookingId: 1 });

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
