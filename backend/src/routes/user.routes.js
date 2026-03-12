'use strict';

const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    setUserStatus,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', isAdmin, getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.patch('/:id/status', isAdmin, setUserStatus);   // activate / deactivate

module.exports = router;
