const express = require('express');
const { togglePropertyFavorite, getFavorites } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/favorites', protect, getFavorites);
router.post('/favorites/property/:id', protect, togglePropertyFavorite);

module.exports = router;
