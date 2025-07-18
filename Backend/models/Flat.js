const mongoose = require('mongoose');

const FlatSchema = new mongoose.Schema({
  block: { type: String, required: true },
  flat_number: { type: String, required: true },
  type: { type: String, enum: ['1BHK', '2BHK', '3BHK'], required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null },
  floor: { type: Number, required: true },
  status: { type: String, enum: ['Occupied', 'Vacant'], required: true },
  apartment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true }
});

module.exports = mongoose.model('Flat', FlatSchema);
