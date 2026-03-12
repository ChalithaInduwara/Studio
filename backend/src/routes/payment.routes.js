'use strict';

const express = require('express');
const router = express.Router();
const { getAllPayments, createPayment, getPaymentById, updatePaymentStatus, getMyPayments } =
    require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', isAdmin, getAllPayments);
router.post('/', isAdmin, createPayment);
router.get('/me', getMyPayments);
router.get('/:id', getPaymentById);
router.patch('/:id/status', isAdmin, updatePaymentStatus);

module.exports = router;
