'use strict';

const Booking = require('../models/Booking.model');
const Studio = require('../models/Studio.model');
const { checkStudioConflict } = require('./conflict.service');
const { sendBookingConfirmation } = require('./email.service');

// ─── Get all bookings ──────────────────────────────────────────────────────
const getAllBookings = async ({ userId, studioId, status, date, role, requestingUserId }) => {
    const filter = {};

    // Non-admins/tutors only see their own bookings
    if (role === 'client' || role === 'student') {
        filter.userId = requestingUserId;
    } else {
        if (userId) filter.userId = userId;
        if (studioId) filter.studioId = studioId;
    }
    if (status) filter.status = status;
    if (date) {
        const day = new Date(date);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        filter.date = { $gte: day, $lt: nextDay };
    }

    return Booking.find(filter)
        .populate('userId', 'name email')
        .populate('studioId', 'name hourlyRate')
        .sort({ date: 1, startTime: 1 });
};

// ─── Create booking (with conflict check) ─────────────────────────────────
const createBooking = async (data) => {
    const { studioId, date, startTime, endTime } = data;

    // 1. Validate studio exists
    const studio = await Studio.findById(studioId);
    if (!studio) {
        const err = new Error('Studio not found'); err.statusCode = 404; throw err;
    }

    // 2. Conflict detection
    const conflict = await checkStudioConflict({ studioId, date, startTime, endTime });
    if (conflict) {
        const err = new Error(
            `Studio is already booked from ${conflict.startTime} to ${conflict.endTime} on that date.`
        );
        err.statusCode = 409;
        err.conflict = conflict;
        throw err;
    }

    // 3. Calculate amount
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const hours = (eh * 60 + em - sh * 60 - sm) / 60;
    const totalAmount = hours * studio.hourlyRate;

    const booking = await Booking.create({ ...data, totalAmount });

    // 4. Fire-and-forget confirmation email (don't await)
    sendBookingConfirmation(booking).catch(console.error);

    return Booking.findById(booking._id)
        .populate('userId', 'name email')
        .populate('studioId', 'name hourlyRate');
};

// ─── Get single booking ────────────────────────────────────────────────────
const getBookingById = async (id) => {
    const booking = await Booking.findById(id)
        .populate('userId', 'name email phone')
        .populate('studioId', 'name hourlyRate');
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }
    return booking;
};

// ─── Update booking ────────────────────────────────────────────────────────
const updateBooking = async (id, data, requestingUser) => {
    const booking = await Booking.findById(id);
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }

    // Only owner or admin can update
    if (requestingUser.role !== 'admin' && booking.userId.toString() !== requestingUser._id.toString()) {
        const e = new Error('Access denied'); e.statusCode = 403; throw e;
    }

    // If time/studio changed, re-check conflict
    const newStartTime = data.startTime || booking.startTime;
    const newEndTime = data.endTime || booking.endTime;
    const newStudioId = data.studioId || booking.studioId;
    const newDate = data.date || booking.date;

    if (data.startTime || data.endTime || data.studioId || data.date) {
        const conflict = await checkStudioConflict({
            studioId: newStudioId,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            excludeBookingId: id,
        });
        if (conflict) {
            const e = new Error(`Conflict: studio already booked ${conflict.startTime}–${conflict.endTime}`);
            e.statusCode = 409; throw e;
        }
    }

    Object.assign(booking, data);
    await booking.save();
    return booking.populate([
        { path: 'userId', select: 'name email' },
        { path: 'studioId', select: 'name hourlyRate' },
    ]);
};

// ─── Delete booking ────────────────────────────────────────────────────────
const deleteBooking = async (id) => {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }
    return booking;
};

module.exports = { getAllBookings, createBooking, getBookingById, updateBooking, deleteBooking };
