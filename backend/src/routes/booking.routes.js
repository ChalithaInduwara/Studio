'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllBookings,
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
    confirmBooking,
    cancelBooking,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isClient } = require('../middleware/role.middleware');

router.use(protect);

// GET  /api/v1/bookings
router.get('/', getAllBookings);

// POST /api/v1/bookings — creates booking, runs conflict detection
router.post('/', createBooking);

// GET  /api/v1/bookings/:id
router.get('/:id', getBookingById);

// PUT  /api/v1/bookings/:id
router.put('/:id', updateBooking);

// PATCH /api/v1/bookings/:id/confirm — admin only
router.patch('/:id/confirm', isAdmin, confirmBooking);

// PATCH /api/v1/bookings/:id/cancel
router.patch('/:id/cancel', cancelBooking);

// DELETE /api/v1/bookings/:id — admin only
router.delete('/:id', isAdmin, deleteBooking);

module.exports = router;
