'use strict';

const classService = require('../services/class.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAllClasses = asyncHandler(async (req, res) => {
    const { tutorId, isActive, isRecurring } = req.query;
    const classes = await classService.getAllClasses({
        tutorId,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        isRecurring: isRecurring !== undefined ? isRecurring === 'true' : undefined,
    });
    return successResponse(res, classes, 'Classes retrieved');
});

// Get classes assigned to the currently logged-in tutor
const getMyClasses = asyncHandler(async (req, res) => {
    const classes = await classService.getTutorClasses(req.user._id);
    return successResponse(res, classes, 'My classes retrieved');
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
    const isAdminRequest = req.user.role === 'admin' || req.user.role === 'tutor';
    const enrollment = await classService.enrollStudent(req.params.id, req.user._id, isAdminRequest);
    const message = isAdminRequest ? 'Enrolled successfully' : 'Enrollment request sent';
    return successResponse(res, enrollment, message, 201);
});

const approveEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.approveEnrollment(req.params.id);
    return successResponse(res, enrollment, 'Enrollment approved');
});

const rejectEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await classService.rejectEnrollment(req.params.id);
    return successResponse(res, enrollment, 'Enrollment rejected');
});

const getPendingRequests = asyncHandler(async (req, res) => {
    const requests = await classService.getPendingEnrollments();
    return successResponse(res, requests, 'Pending requests retrieved');
});

const getMyEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await classService.getStudentEnrollments(req.user._id);
    return successResponse(res, enrollments, 'My enrollments retrieved');
});

const getClassStudents = asyncHandler(async (req, res) => {
    const enrollments = await classService.getClassEnrollments(req.params.id);
    return successResponse(res, enrollments, 'Enrollments retrieved');
});

module.exports = {
    getAllClasses, getMyClasses, createClass, getClassById, updateClass, deleteClass,
    enrollInClass, approveEnrollment, rejectEnrollment, getPendingRequests, getMyEnrollments, getClassStudents
};
