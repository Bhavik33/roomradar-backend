const User = require('../models/User');

// @desc    Toggle favorite status of a property
// @route   POST /api/users/favorites/property/:id
// @access  Private
const togglePropertyFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;

    const isFavorite = user.favoriteProperties.includes(propertyId);

    if (isFavorite) {
      user.favoriteProperties = user.favoriteProperties.filter(
        id => id.toString() !== propertyId
      );
    } else {
      user.favoriteProperties.push(propertyId);
    }

    await user.save();
    res.json({ favorites: user.favoriteProperties, isFavorite: !isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteProperties')
      .populate('favoriteRoommates');
    
    res.json({
      properties: user.favoriteProperties,
      roommates: user.favoriteRoommates
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { togglePropertyFavorite, getFavorites };
