'use strict';

const emailService = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Handle support request from users
 */
const sendSupportRequest = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const user = req.user;

    if (!message || message.trim().length === 0) {
        return errorResponse(res, 'Support message is required', 400);
    }

    try {
        await emailService.sendSupportEmail(user, message);
        return successResponse(res, null, 'Support request sent successfully. Our team will contact you soon.');
    } catch (error) {
        console.error('Support email failed:', error);
        return errorResponse(res, 'Failed to send support request. Please try again later.', 500);
    }
});

module.exports = {
    sendSupportRequest
};
