'use strict';

const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllBookings = asyncHandler(async (req, res) => {
    const { userId, studioId, status, date } = req.query;
    const bookings = await bookingService.getAllBookings({
        userId, studioId, status, date,
        role: req.user.role,
        requestingUserId: req.user._id,
    });
    return successResponse(res, bookings, 'Bookings retrieved');
});

const createBooking = asyncHandler(async (req, res) => {
    const data = { ...req.body, userId: req.user._id };
    const booking = await bookingService.createBooking(data);
    return successResponse(res, booking, 'Booking created', 201);
});

const getBookingById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id);
    return successResponse(res, booking, 'Booking retrieved');
});

const updateBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.updateBooking(req.params.id, req.body, req.user);
    return successResponse(res, booking, 'Booking updated');
});

const deleteBooking = asyncHandler(async (req, res) => {
    await bookingService.deleteBooking(req.params.id);
    return successResponse(res, null, 'Booking deleted');
});

module.exports = { getAllBookings, createBooking, getBookingById, updateBooking, deleteBooking };
