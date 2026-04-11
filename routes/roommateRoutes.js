const express = require('express');
const { getRoommates, createRoommateRequest, deleteRoommateRequest } = require('../controllers/roommateController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getRoommates)
  .post(protect, createRoommateRequest);

router.route('/:id')
  .delete(protect, deleteRoommateRequest);

module.exports = router;
