'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllBookings,
    createBooking,
    getBookingById,
    updateBooking,
    deleteBooking,
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

// DELETE /api/v1/bookings/:id — admin only
router.delete('/:id', isAdmin, deleteBooking);

module.exports = router;
