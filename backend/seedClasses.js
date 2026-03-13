'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const Class = require('./src/models/Class.model');
const { MONGO_URI } = require('./src/config/env');

const tutorId = '69b379c93778c731fa9856ce';

const classes = [
    {
        className: 'Music Theory Workshop',
        description: 'Master the fundamentals of music theory, from scales to complex harmonies.',
        tutorId,
        schedule: {
            day: 'Monday',
            startTime: '16:00',
            endTime: '18:00',
            startDate: new Date('2026-03-01'),
        },
        isRecurring: true,
        capacity: 15,
        onlineLink: 'https://zoom.us/j/123456789'
    },
    {
        className: 'Guitar Basics',
        description: 'Learn your first chords and basic strumming patterns.',
        tutorId,
        schedule: {
            day: 'Wednesday',
            startTime: '10:00',
            endTime: '12:00',
            startDate: new Date('2026-03-01'),
        },
        isRecurring: true,
        capacity: 8
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        await Class.deleteMany({ tutorId }); // Clear old ones for this tutor
        await Class.create(classes);
        console.log('Classes seeded successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
