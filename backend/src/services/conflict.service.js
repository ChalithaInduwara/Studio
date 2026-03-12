'use strict';

const Booking = require('../models/Booking.model');
const Class = require('../models/Class.model');

/**
 * ═══════════════════════════════════════════════════════════════════
 *  CONFLICT DETECTION ENGINE  (Sprint 2 — S2-03)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Overlap algorithm:
 *   Two intervals [A_start, A_end) and [B_start, B_end) overlap when:
 *       A_start < B_end  AND  A_end > B_start
 *
 * We store times as "HH:mm" strings and compare them lexicographically
 * (works correctly for same-day comparisons in 24-hour format).
 */

// ─── Studio conflict ───────────────────────────────────────────────────────
/**
 * Check whether a studio is already booked during the proposed slot on a date.
 *
 * @param {object} p
 * @param {string} p.studioId
 * @param {Date|string} p.date          — booking date (day comparison)
 * @param {string} p.startTime         — "HH:mm"
 * @param {string} p.endTime           — "HH:mm"
 * @param {string} [p.excludeBookingId] — skip this booking id (used on updates)
 * @returns {Promise<object|null>}  conflicting Booking document, or null if clear
 */
const checkStudioConflict = async ({ studioId, date, startTime, endTime, excludeBookingId }) => {
    // Normalise date to day boundary
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const query = {
        studioId,
        date: { $gte: day, $lt: nextDay },
        status: { $in: ['pending', 'confirmed'] },
        startTime: { $lt: endTime },  // existing start < proposed end
        endTime: { $gt: startTime },  // existing end   > proposed start
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return Booking.findOne(query).lean();
};

// ─── Tutor schedule conflict ─────────────────────────────────────────────
/**
 * Check whether a tutor already has a class scheduled at the same day/time.
 *
 * @param {object} p
 * @param {string} p.tutorId
 * @param {string} p.day               — e.g. "Monday"
 * @param {string} p.startTime         — "HH:mm"
 * @param {string} p.endTime           — "HH:mm"
 * @param {string} [p.excludeClassId]
 * @returns {Promise<object|null>}  conflicting Class document, or null if clear
 */
const checkTutorConflict = async ({ tutorId, day, startTime, endTime, excludeClassId }) => {
    const query = {
        tutorId,
        isActive: true,
        'schedule.day': day,
        'schedule.startTime': { $lt: endTime },
        'schedule.endTime': { $gt: startTime },
    };

    if (excludeClassId) {
        query._id = { $ne: excludeClassId };
    }

    return Class.findOne(query).lean();
};

module.exports = { checkStudioConflict, checkTutorConflict };
