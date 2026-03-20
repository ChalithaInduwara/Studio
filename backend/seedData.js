'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Studio = require('./src/models/Studio.model');
const Service = require('./src/models/Service.model');
const Class = require('./src/models/Class.model');

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Create a Tutor
        let tutor = await User.findOne({ email: 'tutor@studiosync.com' });
        if (!tutor) {
            tutor = new User({
                name: 'Jagath Wickramasinghe',
                email: 'tutor@studiosync.com',
                password: 'tutorpassword123',
                role: 'tutor',
                isActive: true
            });
            await tutor.save();
            console.log('✅ Tutor created');
        } else {
            console.log('ℹ️ Tutor already exists');
        }

        // 2. Create a Student
        let student = await User.findOne({ email: 'student@example.com' });
        if (!student) {
            student = new User({
                name: 'Kamal Perera',
                email: 'student@example.com',
                password: 'studentpassword123',
                role: 'student',
                isActive: true
            });
            await student.save();
            console.log('✅ Student created');
        } else {
            console.log('ℹ️ Student already exists');
        }

        // 3. Create Studio Rooms
        const studios = [
            {
                name: 'Studio A (Main)',
                description: 'Professional recording & mixing room',
                hourlyRate: 5000,
                amenities: ['Neve Console', 'Grand Piano'],
                openTime: '09:00',
                closeTime: '22:00'
            },
            {
                name: 'Studio B (Project)',
                description: 'Vocals and editing suite',
                hourlyRate: 3000,
                amenities: ['Avalon Preamp', 'ISO Booth'],
                openTime: '09:00',
                closeTime: '22:00'
            }
        ];

        for (const s of studios) {
            await Studio.findOneAndUpdate({ name: s.name }, s, { upsert: true });
        }
        console.log('✅ Studios created/updated');

        // 4. Create Services
        const services = [
            { name: 'Recording Session', description: 'Studio time with an engineer', price: 4500, unit: 'per hour' },
            { name: 'Mixing (Full Track)', description: 'Professional stereo mixing', price: 15000, unit: 'flat rate' },
            { name: 'Mastering', description: 'Final loudness & polish', price: 8000, unit: 'flat rate' }
        ];

        for (const sv of services) {
            await Service.findOneAndUpdate({ name: sv.name }, sv, { upsert: true });
        }
        console.log('✅ Services created/updated');

        // 5. Create Classes
        const classes = [
            {
                className: 'Vocal Training for Beginners',
                description: 'Fundamental techniques for amateur singers.',
                tutorId: tutor._id,
                schedule: {
                    day: 'Monday',
                    startTime: '10:00',
                    endTime: '12:00'
                },
                capacity: 15,
                isActive: true
            },
            {
                className: 'Classical Guitar Masterclass',
                description: 'Advanced fingerstyle and posture.',
                tutorId: tutor._id,
                schedule: {
                    day: 'Wednesday',
                    startTime: '14:00',
                    endTime: '16:00'
                },
                capacity: 10,
                isActive: true
            }
        ];

        for (const c of classes) {
            await Class.findOneAndUpdate({ className: c.className }, c, { upsert: true });
        }
        console.log('✅ Classes created/updated');

        console.log('\n--- Seeding Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
