'use strict';

const express = require('express');
const router = express.Router();
const { getAllServices, createService, updateService, deleteService } =
    require('../controllers/service.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

// Public — anyone can view services
router.get('/', getAllServices);

// Admin-only management
router.use(protect);
router.post('/', isAdmin, createService);
router.put('/:id', isAdmin, updateService);
router.delete('/:id', isAdmin, deleteService);

module.exports = router;
