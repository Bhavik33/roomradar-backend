const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    universityNearBy: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    }
  },
  price: {
    type: Number,
    required: true,
  },
  deposit: {
    type: Number,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  amenities: [{
    type: String,
  }],
  images: [{
    type: String,
  }],
  availableDate: {
    type: Date,
    required: true,
  },
  furnishing: {
    type: String,
    enum: ['Fully Furnished', 'Semi-Furnished', 'Unfurnished'],
    default: 'Unfurnished',
  },
  preferredTenant: {
    type: String,
    enum: ['Boys', 'Girls', 'Any'],
    default: 'Any',
  },
  category: {
    type: String,
    enum: ['Flat', 'PG', 'Hostel'],
    default: 'Flat',
  },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
