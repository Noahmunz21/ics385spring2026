const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  island: { type: String, required: true },
  type: { type: String, enum: ['hotel', 'vacation rental', 'B&B'], required: true },
  description: { type: String, required: true },
  amenities: [{ type: String }],
  targetSegment: { type: String, required: true },
  imageURL: { type: String },
  reviews: [reviewSchema]
});

module.exports = mongoose.model('Property', propertySchema);
