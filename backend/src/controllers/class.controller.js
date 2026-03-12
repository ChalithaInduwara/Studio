'use strict';

const classService = require('../services/class.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllClasses = asyncHandler(async (req, res) => {
    const { tutorId, isActive, isRecurring } = req.query;
    const classes = await classService.getAllClasses({
        tutorId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        isRecurring: isRecurring !== undefined ? isRecurring === 'true' : undefined,
    });
    return successResponse(res, classes, 'Classes retrieved');
});

const createClass = asyncHandler(async (req, res) => {
    const newClass = await classService.createClass(req.body);
    return successResponse(res, newClass, 'Class created', 201);
});

const getClassById = asyncHandler(async (req, res) => {
    const c = await classService.getClassById(req.params.id);
    return successResponse(res, c, 'Class retrieved');
});

const updateClass = asyncHandler(async (req, res) => {
    const c = await classService.updateClass(req.params.id, req.body);
    return successResponse(res, c, 'Class updated');
});

const deleteClass = asyncHandler(async (req, res) => {
    await classService.deleteClass(req.params.id);
    return successResponse(res, null, 'Class deleted');
});

const enrollInClass = asyncHandler(async (req, res) => {
    const enrollment = await classService.enrollStudent(req.params.id, req.user._id);
    return successResponse(res, enrollment, 'Enrolled successfully', 201);
});

const getClassStudents = asyncHandler(async (req, res) => {
    const enrollments = await classService.getClassEnrollments(req.params.id);
    return successResponse(res, enrollments, 'Enrollments retrieved');
});

module.exports = { getAllClasses, createClass, getClassById, updateClass, deleteClass, enrollInClass, getClassStudents };
