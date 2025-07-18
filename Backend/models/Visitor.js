const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: String,
  phone_number: String,
  vehicle_number: String,
  purpose: String,
  flat_number: String,
  photo_url: String,
  check_in_time: { type: Date, default: Date.now },
  check_out_time: Date,
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Visitor', visitorSchema);
