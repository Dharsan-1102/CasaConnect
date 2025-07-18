const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Gym',
      'Turf',
      'Swimming Pool',
      'Beauty Parlour',
      'Library',
      'Club House',
      'Multipurpose Hall'
    ]
  },
  location: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    required: true
  },
  available_slots: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Amenity', AmenitySchema);
