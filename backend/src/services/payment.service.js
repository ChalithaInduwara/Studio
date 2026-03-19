'use strict';

const Payment = require('../models/Payment.model');

const getAllPayments = async ({ userId, status, role, requestingUserId } = {}) => {
    const filter = {};
    if (role === 'client' || role === 'student') filter.userId = requestingUserId;
    else if (userId) filter.userId = userId;
    if (status) filter.status = status;

    return Payment.find(filter)
        .populate('userId', 'name email')
        .populate('referenceId')
        .sort({ createdAt: -1 });
};

const createPayment = async (data) => {
    return Payment.create(data);
};

const getPaymentById = async (id) => {
    const p = await Payment.findById(id)
        .populate('userId', 'name email')
        .populate('referenceId');
    if (!p) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
    return p;
};

const updatePaymentStatus = async (id, status) => {
    const update = { status };
    if (status === 'paid') update.paidAt = new Date();

    const payment = await Payment.findByIdAndUpdate(id, update, { new: true });
    if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }
    return payment;
};

const processDummyPayment = async (id, requestingUserId) => {
    const payment = await Payment.findById(id).populate('referenceId');
    if (!payment) { const e = new Error('Payment not found'); e.statusCode = 404; throw e; }

    // Ensure only the owner can pay
    if (payment.userId.toString() !== requestingUserId.toString()) {
        const e = new Error('Access denied'); e.statusCode = 403; throw e;
    }

    if (payment.status === 'paid') return payment;

    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // If it's a booking, update booking status to 'completed'
    if (payment.referenceModel === 'Booking' && payment.referenceId) {
        const Booking = require('../models/Booking.model');
        await Booking.findByIdAndUpdate(payment.referenceId._id, { status: 'completed' });
    }

    return payment;
};

const getPaymentsByUser = async (userId) => {
    return Payment.find({ userId })
        .populate('referenceId')
        .sort({ createdAt: -1 });
};

module.exports = {
    getAllPayments,
    createPayment,
    getPaymentById,
    updatePaymentStatus,
    getPaymentsByUser,
    processDummyPayment
};
