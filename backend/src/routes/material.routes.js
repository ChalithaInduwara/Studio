'use strict';

const express = require('express');
const router = express.Router();
const { uploadMaterial, getMaterials, getMaterialById, deleteMaterial } =
    require('../controllers/material.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isTutor } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getMaterials);
router.post('/', isTutor, uploadMaterial);
router.get('/:id', getMaterialById);
router.delete('/:id', isTutor, deleteMaterial);

module.exports = router;
