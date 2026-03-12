'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { NODE_ENV, CORS_ORIGIN } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// ── Route imports ──────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const bookingRoutes = require('./routes/booking.routes');
const classRoutes = require('./routes/class.routes');
const studioRoutes = require('./routes/studio.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const tutorRoutes = require('./routes/tutor.routes');
const serviceRoutes = require('./routes/service.routes');
const materialRoutes = require('./routes/material.routes');
const paymentRoutes = require('./routes/payment.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// ── Security & request-parsing middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: CORS_ORIGIN.split(',').map(o => o.trim()),
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving for uploads ───────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ── Request logger (skip in test env) ─────────────────────────────────────
if (NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ── Health-check ───────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'StudioSync API',
        version: 'v1',
    });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/studios', studioRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/tutors', tutorRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── 404 & global error handlers ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
