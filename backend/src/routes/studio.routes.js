'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllStudios,
    createStudio,
    getStudioById,
    updateStudio,
    deleteStudio,
} = require('../controllers/studio.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

// Public — anyone can view available studios
router.get('/', getAllStudios);
router.get('/:id', protect, getStudioById);

// Protected — admin only
router.post('/', protect, isAdmin, createStudio);
router.put('/:id', protect, isAdmin, updateStudio);
router.delete('/:id', protect, isAdmin, deleteStudio);

module.exports = router;
