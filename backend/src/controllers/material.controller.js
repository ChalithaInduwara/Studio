'use strict';

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const Material = require('../models/Material.model');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─── Multer disk storage config ────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // ensure this folder exists at backend root
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif',
        'audio/mpeg', 'audio/wav', 'audio/mp4',
        'video/mp4', 'video/mpeg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ─── Controllers ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/materials
 * Multipart upload. Fields: file (required), title, materialType, classId/bookingId
 */
const uploadMaterial = [
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) return errorResponse(res, 'No file uploaded', 400);

        const material = await Material.create({
            title: req.body.title || req.file.originalname,
            description: req.body.description,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            materialType: req.body.materialType || 'learning',
            classId: req.body.classId,
            bookingId: req.body.bookingId,
            uploadedBy: req.user._id,
            isPublic: req.body.isPublic === 'true',
        });

        return successResponse(res, material, 'File uploaded successfully', 201);
    }),
];

const getMaterials = asyncHandler(async (req, res) => {
    const { classId, bookingId, materialType } = req.query;
    const filter = {};
    if (classId) filter.classId = classId;
    if (bookingId) filter.bookingId = bookingId;
    if (materialType) filter.materialType = materialType;

    const materials = await Material.find(filter)
        .populate('uploadedBy', 'name')
        .populate('classId', 'className')
        .sort({ createdAt: -1 });

    return successResponse(res, materials, 'Materials retrieved');
});

const getMaterialById = asyncHandler(async (req, res) => {
    const m = await Material.findById(req.params.id)
        .populate('uploadedBy', 'name')
        .populate('classId', 'className');
    if (!m) return errorResponse(res, 'Material not found', 404);
    return successResponse(res, m, 'Material retrieved');
});

const deleteMaterial = asyncHandler(async (req, res) => {
    const m = await Material.findByIdAndDelete(req.params.id);
    if (!m) return errorResponse(res, 'Material not found', 404);
    // TODO: also delete the file from disk (fs.unlink)
    return successResponse(res, null, 'Material deleted');
});

module.exports = { uploadMaterial, getMaterials, getMaterialById, deleteMaterial };
