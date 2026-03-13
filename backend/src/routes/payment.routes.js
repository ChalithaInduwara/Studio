'use strict';

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', isAdmin, paymentController.getAllPayments);
router.post('/', isAdmin, paymentController.createPayment);
router.get('/me', paymentController.getMyPayments);
router.get('/:id', paymentController.getPaymentById);
router.patch('/:id/status', isAdmin, paymentController.updatePaymentStatus);

router.route('/:id/invoice')
    .get(paymentController.downloadInvoice);

router.route('/:id/send-invoice')
    .post(paymentController.sendInvoiceEmail);

router.route('/:id/send-reminder')
    .post(paymentController.sendReminderEmail);

module.exports = router;
