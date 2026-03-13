'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./src/models/Service.model');
const Studio = require('./src/models/Studio.model');
const { MONGO_URI } = require('./src/config/env');

const services = [
    {
        name: 'Recording Session',
        description: 'Professional multi-track recording with an engineer.',
        price: 5000,
        unit: 'per hour',
        isActive: true
    },
    {
        name: 'Mixing',
        description: 'Professional mixing for your tracks.',
        price: 8500,
        unit: 'per track',
        isActive: true
    },
    {
        name: 'Mastering',
        description: 'High-quality mastering for release-ready sound.',
        price: 4500,
        unit: 'per track',
        isActive: true
    },
    {
        name: 'Podcast Recording',
        description: 'High-quality podcast recording for up to 4 people.',
        price: 3500,
        unit: 'per hour',
        isActive: true
    },
    {
        name: 'Rehearsal',
        description: 'Fully equipped rehearsal space for bands.',
        price: 2000,
        unit: 'per hour',
        isActive: true
    }
];

const studios = [
    {
        name: 'Studio A (Main)',
        description: 'Our flagship studio with top-tier analog gear.',
        hourlyRate: 5000,
        openTime: '08:00',
        closeTime: '22:00',
        amenities: ['Analog Console', 'U87 Microphone', 'Grand Piano'],
        isActive: true
    },
    {
        name: 'Studio B (Vocal Suite)',
        description: 'Optimized for clean vocal and voiceover recording.',
        hourlyRate: 2500,
        openTime: '08:00',
        closeTime: '22:00',
        amenities: ['Acoustically Treated Booth', 'Avalon Preamp'],
        isActive: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅  Connected to MongoDB for seeding');

        // Clear existing data (optional, but good for clean seed)
        await Service.deleteMany({});
        await Studio.deleteMany({});
        console.log('🗑️   Cleared existing services and studios');

        await Service.insertMany(services);
        console.log('✅  Inserted realistic services');

        await Studio.insertMany(studios);
        console.log('✅  Inserted realistic studios');

        console.log('🎉  Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌  Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
