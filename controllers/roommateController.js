const Roommate = require('../models/Roommate');

// @desc    Get all roommate requests
// @route   GET /api/roommates
// @access  Public
const getRoommates = async (req, res) => {
  try {
    const roommates = await Roommate.find({}).populate('user', 'name email avatar');
    res.json(roommates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a roommate request
// @route   POST /api/roommates
// @access  Private
const createRoommateRequest = async (req, res) => {
  const { 
    bio, gender, budget, foodHabits, lifestyle, 
    city, university, occupation, habits, moveInDate 
  } = req.body;

  try {
    const roommate = new Roommate({
      user: req.user._id,
      bio,
      gender,
      budget,
      foodHabits,
      lifestyle,
      city,
      university,
      occupation,
      habits,
      moveInDate,
    });

    const createdRoommate = await roommate.save();
    res.status(201).json(createdRoommate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a roommate request
// @route   DELETE /api/roommates/:id
// @access  Private
const deleteRoommateRequest = async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);

    if (!roommate) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (roommate.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this profile' });
    }

    await roommate.deleteOne();
    res.json({ message: 'Profile removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoommates, createRoommateRequest, deleteRoommateRequest };
