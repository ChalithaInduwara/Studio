'use strict';

const mongoose = require('mongoose');

/**
 * Payment / Invoice Schema (S3-05 + S3-06)
 */
const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        // What this payment is for
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'referenceModel',
        },
        referenceModel: {
            type: String,
            enum: ['Booking', 'Class'],
        },
        // Invoice details
        invoiceNumber: {
            type: String,
            unique: true,
        },
        invoiceDate: {
            type: Date,
            default: Date.now,
        },
        dueDate: {
            type: Date,
        },
        notes: { type: String, trim: true },
        paidAt: { type: Date },
    },
    { timestamps: true }
);

// Auto-generate invoice number before saving
paymentSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Payment').countDocuments();
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ invoiceNumber: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
