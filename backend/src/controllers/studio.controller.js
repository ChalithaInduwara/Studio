'use strict';

const Studio = require('../models/Studio.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllStudios = asyncHandler(async (req, res) => {
    const studios = await Studio.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, studios, 'Studios retrieved');
});

const createStudio = asyncHandler(async (req, res) => {
    const studio = await Studio.create(req.body);
    return successResponse(res, studio, 'Studio created', 201);
});

const getStudioById = asyncHandler(async (req, res) => {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return errorResponse(res, 'Studio not found', 404);
    return successResponse(res, studio, 'Studio retrieved');
});

const updateStudio = asyncHandler(async (req, res) => {
    const studio = await Studio.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!studio) return errorResponse(res, 'Studio not found', 404);
    return successResponse(res, studio, 'Studio updated');
});

const deleteStudio = asyncHandler(async (req, res) => {
    const studio = await Studio.findByIdAndDelete(req.params.id);
    if (!studio) return errorResponse(res, 'Studio not found', 404);
    return successResponse(res, null, 'Studio deleted');
});

module.exports = { getAllStudios, createStudio, getStudioById, updateStudio, deleteStudio };
