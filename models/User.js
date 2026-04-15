const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: '',
  },
  preferences: {
    gender: { type: String },
    budget: { type: Number },
    foodHabits: { type: String, enum: ['Veg', 'Non-Veg', 'Any'], default: 'Any' },
    lifestyle: { type: String },
    cleanliness: { type: Number, min: 1, max: 10, default: 5 },
    sleepSchedule: { type: String, enum: ['Early Bird', 'Night Owl', 'Flexible'], default: 'Flexible' },
    smoking: { type: String, enum: ['Yes', 'No', 'Social'], default: 'No' },
    drinking: { type: String, enum: ['Yes', 'No', 'Social'], default: 'No' },
    guestPolicy: { type: String, enum: ['Frequent', 'Occasional', 'None'], default: 'Occasional' },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
  },
  favoriteProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  favoriteRoommates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roommate'
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
