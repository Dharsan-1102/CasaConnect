const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  resident_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  due_date: Date,
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  generated_on: { type: Date, default: Date.now },
  category: { type: String, enum: ['Maintenance', 'Water', 'Electricity'] }
});

module.exports = mongoose.model('Bill', billSchema);
