'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const { MONGO_URI } = require('./src/config/env');

const run = async () => {
    await mongoose.connect(MONGO_URI);
    const users = await User.find({}, '_id name email role');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
};
run();
