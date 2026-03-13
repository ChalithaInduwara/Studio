'use strict';

const Class = require('../models/Class.model');
const Enrollment = require('../models/Enrollment.model');
const { checkTutorConflict } = require('./conflict.service');
const { sendEnrollmentConfirmation } = require('./email.service');

// ─── Get all classes ───────────────────────────────────────────────────────
const getAllClasses = async ({ tutorId, isActive, isRecurring } = {}) => {
    const filter = {};
    if (tutorId) filter.tutorId = tutorId;
    if (isActive !== undefined) filter.isActive = isActive;
    if (isRecurring !== undefined) filter.isRecurring = isRecurring;

    return Class.find(filter)
        .populate('tutorId', 'name email')
        .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });
};

// ─── Get classes for the logged-in tutor ──────────────────────────────────
const getTutorClasses = async (tutorId) => {
    return Class.find({ tutorId })
        .populate('tutorId', 'name email')
        .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });
};

// ─── Create class (with tutor conflict check) ──────────────────────────────
const createClass = async (data) => {
    const { tutorId, schedule } = data;

    if (schedule?.day && schedule?.startTime && schedule?.endTime) {
        const conflict = await checkTutorConflict({
            tutorId,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
        });
        if (conflict) {
            const err = new Error(
                `Tutor already has "${conflict.className}" scheduled on ${schedule.day} at ${conflict.schedule.startTime}–${conflict.schedule.endTime}`
            );
            err.statusCode = 409;
            throw err;
        }
    }

    const newClass = await Class.create(data);
    return newClass.populate('tutorId', 'name email');
};

// ─── Get by ID ─────────────────────────────────────────────────────────────
const getClassById = async (id) => {
    const c = await Class.findById(id).populate('tutorId', 'name email');
    if (!c) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }
    return c;
};

// ─── Update class ──────────────────────────────────────────────────────────
const updateClass = async (id, data) => {
    const existing = await Class.findById(id);
    if (!existing) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }

    const schedule = { ...existing.schedule.toObject(), ...(data.schedule || {}) };
    const tutorId = data.tutorId || existing.tutorId;

    if (data.schedule || data.tutorId) {
        const conflict = await checkTutorConflict({
            tutorId,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            excludeClassId: id,
        });
        if (conflict) {
            const err = new Error(`Tutor conflict on ${schedule.day} at ${conflict.schedule.startTime}–${conflict.schedule.endTime}`);
            err.statusCode = 409; throw err;
        }
    }

    return Class.findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .populate('tutorId', 'name email');
};

// ─── Delete class ──────────────────────────────────────────────────────────
const deleteClass = async (id) => {
    const c = await Class.findByIdAndDelete(id);
    if (!c) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }
    return c;
};

// ─── Enroll student (Request) ──────────────────────────────────────────────
const enrollStudent = async (classId, studentId, isAdminRequest = false) => {
    const classDoc = await Class.findById(classId);
    if (!classDoc) { const e = new Error('Class not found'); e.statusCode = 404; throw e; }
    if (!classDoc.isActive) { const e = new Error('Class is not active'); e.statusCode = 400; throw e; }

    // Capacity check (only for active enrollments, but let's check for pending too to prevent over-requesting)
    if (classDoc.enrolledCount >= classDoc.capacity) {
        const err = new Error('Class is at full capacity'); err.statusCode = 409; throw err;
    }

    try {
        const enrollment = await Enrollment.create({
            studentId,
            classId,
            status: isAdminRequest ? 'active' : 'pending'
        });

        if (isAdminRequest) {
            await Class.findByIdAndUpdate(classId, { $inc: { enrolledCount: 1 } });
            sendEnrollmentConfirmation(enrollment, classDoc).catch(console.error);
        }

        return enrollment.populate([
            { path: 'studentId', select: 'name email' },
            { path: 'classId', select: 'className schedule' },
        ]);
    } catch (err) {
        if (err.code === 11000) {
            const e = new Error('Student already has a request or enrollment for this class'); e.statusCode = 409; throw e;
        }
        throw err;
    }
};

// ─── Approve Enrollment ────────────────────────────────────────────────────
const approveEnrollment = async (enrollmentId) => {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) { const e = new Error('Enrollment not found'); e.statusCode = 404; throw e; }
    if (enrollment.status !== 'pending') { const e = new Error('Enrollment is not pending'); e.statusCode = 400; throw e; }

    const classDoc = await Class.findById(enrollment.classId);
    if (classDoc.enrolledCount >= classDoc.capacity) {
        const err = new Error('Class is now at full capacity'); err.statusCode = 409; throw err;
    }

    enrollment.status = 'active';
    await enrollment.save();

    await Class.findByIdAndUpdate(enrollment.classId, { $inc: { enrolledCount: 1 } });

    sendEnrollmentConfirmation(enrollment, classDoc).catch(console.error);

    return enrollment.populate([
        { path: 'studentId', select: 'name email' },
        { path: 'classId', select: 'className schedule' },
    ]);
};

// ─── Reject Enrollment ─────────────────────────────────────────────────────
const rejectEnrollment = async (enrollmentId) => {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) { const e = new Error('Enrollment not found'); e.statusCode = 404; throw e; }
    if (enrollment.status !== 'pending') { const e = new Error('Enrollment is not pending'); e.statusCode = 400; throw e; }

    enrollment.status = 'dropped'; // Or 'rejected' if we add it to enum, 'dropped' is already there
    await enrollment.save();

    return enrollment.populate([
        { path: 'studentId', select: 'name email' },
        { path: 'classId', select: 'className schedule' },
    ]);
};

// ─── Get Pending Requests ──────────────────────────────────────────────────
const getPendingEnrollments = async () => {
    return Enrollment.find({ status: 'pending' })
        .populate('studentId', 'name email phone')
        .populate('classId', 'className');
};

// ─── Get enrollments for current student ──────────────────────────────────
const getStudentEnrollments = async (studentId) => {
    return Enrollment.find({ studentId })
        .populate('classId', 'className schedule onlineLink');
};

// ─── Get students enrolled in a class ─────────────────────────────────────
const getClassEnrollments = async (classId) => {
    return Enrollment.find({ classId, status: 'active' })
        .populate('studentId', 'name email phone');
};

module.exports = {
    getAllClasses, getTutorClasses, createClass, getClassById, updateClass, deleteClass,
    enrollStudent, approveEnrollment, rejectEnrollment, getPendingEnrollments, getStudentEnrollments, getClassEnrollments,
};
