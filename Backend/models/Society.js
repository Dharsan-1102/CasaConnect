const mongoose = require('mongoose');

const SocietySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: Number, required: true }
});

module.exports = mongoose.model('Society', SocietySchema);
