'use strict';

const paymentService = require('../services/payment.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await paymentService.getAllPayments({
        userId: req.query.userId,
        status: req.query.status,
        role: req.user.role,
        requestingUserId: req.user._id,
    });
    return successResponse(res, payments, 'Payments retrieved');
});

const createPayment = asyncHandler(async (req, res) => {
    const data = { ...req.body, userId: req.body.userId || req.user._id };
    const payment = await paymentService.createPayment(data);
    return successResponse(res, payment, 'Payment record created', 201);
});

const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id);
    return successResponse(res, payment, 'Payment retrieved');
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) return errorResponse(res, '`status` is required', 400);
    const payment = await paymentService.updatePaymentStatus(req.params.id, status);
    return successResponse(res, payment, 'Payment status updated');
});

const getMyPayments = asyncHandler(async (req, res) => {
    const payments = await paymentService.getPaymentsByUser(req.user._id);
    return successResponse(res, payments, 'Your payments retrieved');
});

module.exports = { getAllPayments, createPayment, getPaymentById, updatePaymentStatus, getMyPayments };
