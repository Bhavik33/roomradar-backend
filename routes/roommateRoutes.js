const express = require('express');
const { getRoommates, createRoommateRequest, deleteRoommateRequest } = require('../controllers/roommateController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', optionalProtect, getRoommates);
router.post('/', protect, createRoommateRequest);
router.delete('/:id', protect, deleteRoommateRequest);

module.exports = router;
