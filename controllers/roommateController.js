const User = require('../models/User');
const Roommate = require('../models/Roommate');

// Helper function to calculate compatibility score
const calculateScore = (userPrefs, roommate) => {
  if (!userPrefs) return null;
  
  let score = 0;
  let totalPoints = 0;

  // 1. Food Habits (20 points)
  totalPoints += 20;
  if (userPrefs.foodHabits === 'Any' || roommate.foodHabits === 'Any' || userPrefs.foodHabits === roommate.foodHabits) {
    score += 20;
  }

  // 2. Cleanliness (20 points)
  totalPoints += 20;
  // Score based on how close the cleanliness levels are (1-10)
  const cleanlinessDiff = Math.abs((userPrefs.cleanliness || 5) - (roommate.habits?.cleanliness || 5));
  score += Math.max(0, 20 - (cleanlinessDiff * 2));

  // 3. Sleep Schedule (20 points)
  totalPoints += 20;
  if (userPrefs.sleepSchedule === roommate.habits?.sleepSchedule) {
    score += 20;
  } else if (userPrefs.sleepSchedule === 'Flexible' || roommate.habits?.sleepSchedule === 'Flexible') {
    score += 10;
  }

  // 4. Habits: Smoking & Drinking (20 points)
  totalPoints += 20;
  let habitScore = 0;
  if (userPrefs.smoking === roommate.habits?.smoking) habitScore += 10;
  if (userPrefs.drinking === roommate.habits?.drinking) habitScore += 10;
  score += habitScore;

  // 5. Guest Policy (20 points)
  totalPoints += 20;
  if (userPrefs.guestPolicy === roommate.habits?.guestPolicy) {
    score += 20;
  } else if (
    (userPrefs.guestPolicy === 'Occasional' && (roommate.habits?.guestPolicy === 'None' || roommate.habits?.guestPolicy === 'Frequent')) ||
    (roommate.habits?.guestPolicy === 'Occasional' && (userPrefs.guestPolicy === 'None' || userPrefs.guestPolicy === 'Frequent'))
  ) {
    score += 10;
  }

  return Math.round((score / totalPoints) * 100);
};

// @desc    Get all roommate requests
// @route   GET /api/roommates
// @access  Public
const getRoommates = async (req, res) => {
  try {
    const roommates = await Roommate.find({}).populate('user', 'name email avatar preferences');
    
    // Check if user is logged in (via auth middleware which might have attached req.user)
    // However, getRoommates is Public, so we check if req.user exists
    // We'll use a hack: if they want scores, they should be logged in. 
    // We can check req.headers.authorization manually or trust the middleware if we changed the route to protect-optional.
    
    // For now, let's assume we want to support both. 
    // If the frontend sends the token, the protect middleware (if applied) will set req.user.
    
    let userPrefs = null;
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      userPrefs = currentUser?.preferences || null;
    }

    const roommatesWithScores = roommates.map(r => {
      const roommateObj = r.toObject();
      roommateObj.matchScore = calculateScore(userPrefs, roommateObj);
      return roommateObj;
    });

    res.json(roommatesWithScores);
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
