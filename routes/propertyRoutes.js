const express = require('express');
const { getProperties, getPropertyById, createProperty, deleteProperty } = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

router.route('/:id')
  .get(getPropertyById)
  .delete(protect, deleteProperty);

module.exports = router;
