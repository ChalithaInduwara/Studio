'use strict';

const activityService = require('../services/activity.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get recent activities for the logged-in tutor.
 */
const getTutorActivities = asyncHandler(async (req, res) => {
    const activities = await activityService.getTutorActivities(req.user._id);
    return successResponse(res, activities, 'Tutor activities retrieved');
});

module.exports = { getTutorActivities };
