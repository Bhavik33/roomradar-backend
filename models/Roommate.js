const mongoose = require('mongoose');

const roommateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Any'],
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  foodHabits: {
    type: String,
    required: true,
  },
  lifestyle: {
    type: String,
  },
  occupation: {
    type: String,
    enum: ['Student', 'Working Professional', 'Other'],
    default: 'Student',
  },
  habits: {
    smoking: { type: String, enum: ['Yes', 'No', 'Social'], default: 'No' },
    drinking: { type: String, enum: ['Yes', 'No', 'Social'], default: 'No' },
    cleanliness: { type: Number, min: 1, max: 10, default: 5 },
    sleepSchedule: { type: String, enum: ['Early Bird', 'Night Owl', 'Flexible'], default: 'Flexible' },
    guestPolicy: { type: String, enum: ['Frequent', 'Occasional', 'None'], default: 'Occasional' },
  },
  moveInDate: {
    type: Date,
  },
  city: {
    type: String,
    required: true,
  },
  university: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Roommate', roommateSchema);
