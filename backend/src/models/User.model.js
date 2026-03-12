'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['student', 'client', 'tutor', 'admin'];

/**
 * User Schema
 *
 * Represents any authenticated system user (student, client, tutor, admin).
 * Passwords are hashed with bcrypt before saving.
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // never returned in queries by default
        },
        role: {
            type: String,
            enum: ROLES,
            default: 'student',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Optional profile fields — populated later
        phone: { type: String, trim: true },
        avatarUrl: { type: String },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

// ── Pre-save hook: hash password ───────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare password ─────────────────────────────────────
/**
 * @param {string} candidatePassword — plain-text password to verify
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Do not expose password hash in JSON responses ─────────────────────────
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
