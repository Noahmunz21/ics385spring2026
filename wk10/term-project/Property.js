const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  island: { type: String, required: true },
  type: { type: String, enum: ['hotel', 'vacation rental', 'B&B'], required: true },
  description: { type: String, required: true },
  amenities: [{ type: String }],
  targetSegment: { type: String, required: true },
  imageURL: { type: String }
});

module.exports = mongoose.model('Property', propertySchema);
