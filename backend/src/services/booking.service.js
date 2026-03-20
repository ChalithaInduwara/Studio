'use strict';

const Booking = require('../models/Booking.model');
const Studio = require('../models/Studio.model');
const Service = require('../models/Service.model');
const Material = require('../models/Material.model'); // Added to register model
const { checkStudioConflict } = require('./conflict.service');
const { sendBookingConfirmation } = require('./email.service');

// ─── Helper to calculate total amount ──────────────────────────────────────
const calculateTotalAmount = async ({ studioId, services, startTime, endTime }) => {
    if (!startTime || !endTime || !studioId) return 0;

    const studio = await Studio.findById(studioId);
    if (!studio) throw new Error('Studio not found');

    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    if (startParts.length !== 2 || endParts.length !== 2) return 0;

    const [sh, sm] = startParts.map(Number);
    const [eh, em] = endParts.map(Number);

    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;

    let minutes = (eh * 60 + em) - (sh * 60 + sm);
    if (minutes <= 0) minutes += 24 * 60;
    const hours = minutes / 60;

    let total = hours * studio.hourlyRate;

    // Handle single string or array of services
    const serviceList = Array.isArray(services) ? services : (services ? [services] : []);

    for (const serviceName of serviceList) {
        const service = await Service.findOne({ name: serviceName });
        if (service) {
            if (service.unit === 'per hour') {
                total += hours * service.price;
            } else {
                total += service.price;
            }
        }
    }

    return Math.max(0, Math.round(total * 100) / 100);
};

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
        .populate('materials')
        .sort({ date: 1, startTime: 1 });
};

// ─── Create booking (with conflict check) ─────────────────────────────────
const createBooking = async (data) => {
    const { studioId, date, startTime, endTime, services } = data;

    // 1. Conflict detection
    const conflict = await checkStudioConflict({ studioId, date, startTime, endTime });
    if (conflict) {
        const err = new Error(
            `Studio is already booked from ${conflict.startTime} to ${conflict.endTime} on that date.`
        );
        err.statusCode = 409;
        err.conflict = conflict;
        throw err;
    }

    // 2. Calculate amount
    const totalAmount = await calculateTotalAmount({ studioId, services, startTime, endTime });

    const booking = await Booking.create({ ...data, totalAmount });

    // 3. Fire-and-forget confirmation email
    sendBookingConfirmation(booking).catch(console.error);

    return Booking.findById(booking._id)
        .populate('userId', 'name email')
        .populate('studioId', 'name hourlyRate')
        .populate('materials');
};

// ─── Get single booking ────────────────────────────────────────────────────
const getBookingById = async (id) => {
    const booking = await Booking.findById(id)
        .populate('userId', 'name email phone')
        .populate('studioId', 'name hourlyRate')
        .populate('materials');
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

    // If time/studio/service changed, re-check conflict and recalculate price
    const newStartTime = data.startTime || booking.startTime;
    const newEndTime = data.endTime || booking.endTime;
    const newStudioId = data.studioId || booking.studioId;
    const newDate = data.date || booking.date;
    const newServices = data.services || booking.services;

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

    // Recalculate if pricing factors changed
    if (data.startTime || data.endTime || data.studioId || data.services) {
        data.totalAmount = await calculateTotalAmount({
            studioId: newStudioId,
            services: newServices,
            startTime: newStartTime,
            endTime: newEndTime
        });
    }

    Object.assign(booking, data);
    await booking.save();
    return booking.populate([
        { path: 'userId', select: 'name email' },
        { path: 'studioId', select: 'name hourlyRate' },
        { path: 'materials' }
    ]);
};

const confirmBooking = async (id) => {
    const booking = await Booking.findById(id).populate('userId studioId');
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }

    booking.status = 'confirmed';
    await booking.save();

    // Create a payment/invoice for this booking
    const Payment = require('../models/Payment.model');
    await Payment.create({
        userId: booking.userId._id,
        amount: booking.totalAmount,
        status: 'pending',
        type: 'studio',
        referenceId: booking._id,
        referenceModel: 'Booking',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    sendBookingConfirmation(booking).catch(console.error);
    return booking;
};

const cancelBooking = async (id) => {
    const booking = await Booking.findById(id);
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }

    booking.status = 'cancelled';
    await booking.save();
    return booking;
};

const deleteBooking = async (id) => {
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) { const e = new Error('Booking not found'); e.statusCode = 404; throw e; }
    return booking;
};

module.exports = {
    getAllBookings, createBooking, getBookingById, updateBooking, deleteBooking,
    confirmBooking, cancelBooking
};
