'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const { MONGO_URI } = require('./src/config/env');

const adminData = {
    name: 'Studio Admin',
    email: 'admin@studiosync.com',
    password: 'adminpassword123',
    role: 'admin',
    isActive: true
};

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅  Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️   Admin user already exists. Updating password...');
            existingAdmin.password = adminData.password;
            await existingAdmin.save();
            console.log('✅  Admin password updated');
        } else {
            const newAdmin = new User(adminData);
            await newAdmin.save();
            console.log('✅  Admin user created successfully');
        }

        console.log('\n--- Admin Credentials ---');
        console.log(`Email: ${adminData.email}`);
        console.log(`Password: ${adminData.password}`);
        console.log('-------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌  Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
