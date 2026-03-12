'use strict';

const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get all users (with optional role filter & pagination)
 * @route   GET /api/v1/users?role=student&page=1&limit=20
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    return successResponse(res, {
        users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    }, 'Users retrieved');
});

/**
 * @desc    Get a single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (own profile or admin)
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    // Non-admins can only view their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return errorResponse(res, 'Access denied.', 403);
    }

    return successResponse(res, user, 'User retrieved');
});

/**
 * @desc    Update a user
 * @route   PUT /api/v1/users/:id
 * @access  Private (own profile or admin)
 */
const updateUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return errorResponse(res, 'Access denied.', 403);
    }

    // Prevent role escalation by non-admins
    const allowedFields = ['name', 'phone', 'avatarUrl'];
    if (req.user.role === 'admin') allowedFields.push('role', 'isActive');

    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });
    if (!user) return errorResponse(res, 'User not found', 404);

    return successResponse(res, user, 'User updated');
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/v1/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, null, 'User deleted');
});

/**
 * @desc    Activate or deactivate a user account
 * @route   PATCH /api/v1/users/:id/status
 * @access  Admin
 */
const setUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
        return errorResponse(res, '`isActive` (boolean) is required', 400);
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
    );
    if (!user) return errorResponse(res, 'User not found', 404);

    const action = isActive ? 'activated' : 'deactivated';
    return successResponse(res, user, `User account ${action}`);
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, setUserStatus };
