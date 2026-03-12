'use strict';

const Booking = require('../models/Booking.model');
const Class = require('../models/Class.model');
const User = require('../models/User.model');
const Enrollment = require('../models/Enrollment.model');
const Attendance = require('../models/Attendance.model');
const Payment = require('../models/Payment.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * GET /api/v1/analytics/bookings
 * Total bookings, revenue, and bookings by studio/status.
 */
const getBookingAnalytics = asyncHandler(async (req, res) => {
    const [statusBreakdown, revenueByStudio, monthly] = await Promise.all([
        // Bookings by status
        Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
        ]),
        // Revenue by studio
        Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: '$studioId', totalRevenue: { $sum: '$totalAmount' }, bookingCount: { $sum: 1 } } },
            { $lookup: { from: 'studios', localField: '_id', foreignField: '_id', as: 'studio' } },
            { $unwind: { path: '$studio', preserveNullAndEmptyArrays: true } },
            { $project: { studioName: '$studio.name', totalRevenue: 1, bookingCount: 1 } },
        ]),
        // Monthly booking counts (last 12 months)
        Booking.aggregate([
            { $match: { date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    count: { $sum: 1 }, revenue: { $sum: '$totalAmount' },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
    ]);

    return successResponse(res, { statusBreakdown, revenueByStudio, monthly }, 'Booking analytics retrieved');
});

/**
 * GET /api/v1/analytics/classes
 * Enrollment counts, most popular classes, attendance rates.
 */
const getClassAnalytics = asyncHandler(async (req, res) => {
    const [topClasses, enrollmentByDay, attendanceRates] = await Promise.all([
        // Top 10 most enrolled classes
        Class.find({ isActive: true }).sort({ enrolledCount: -1 }).limit(10)
            .select('className enrolledCount capacity tutorId')
            .populate('tutorId', 'name'),
        // Enrollments by day of week
        Class.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$schedule.day', totalEnrolled: { $sum: '$enrolledCount' } } },
        ]),
        // Overall attendance rate
        Attendance.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                }
            },
        ]),
    ]);

    return successResponse(res, { topClasses, enrollmentByDay, attendanceRates }, 'Class analytics retrieved');
});

/**
 * GET /api/v1/analytics/revenue
 * Monthly revenue totals and payment status breakdown.
 */
const getRevenueAnalytics = asyncHandler(async (req, res) => {
    const [monthly, statusBreakdown, total] = await Promise.all([
        Payment.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
                    revenue: { $sum: '$amount' }, count: { $sum: 1 },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        Payment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
        ]),
        Payment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);

    return successResponse(res, {
        monthly,
        statusBreakdown,
        totalRevenue: total[0]?.total || 0,
    }, 'Revenue analytics retrieved');
});

/**
 * GET /api/v1/analytics/overview
 * Dashboard summary counts.
 */
const getOverview = asyncHandler(async (req, res) => {
    const [users, bookings, classes, payments] = await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        Class.countDocuments({ isActive: true }),
        Payment.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);

    return successResponse(res, {
        usersByRole: users,
        activeBookings: bookings,
        activeClasses: classes,
        totalRevenuePaid: payments[0]?.total || 0,
    }, 'Overview retrieved');
});

module.exports = { getBookingAnalytics, getClassAnalytics, getRevenueAnalytics, getOverview };
