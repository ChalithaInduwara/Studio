'use strict';

const Service = require('../models/Service.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, services, 'Services retrieved');
});

const createService = asyncHandler(async (req, res) => {
    const service = await Service.create(req.body);
    return successResponse(res, service, 'Service created', 201);
});

const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return errorResponse(res, 'Service not found', 404);
    return successResponse(res, service, 'Service updated');
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return errorResponse(res, 'Service not found', 404);
    return successResponse(res, null, 'Service deleted');
});

module.exports = { getAllServices, createService, updateService, deleteService };
