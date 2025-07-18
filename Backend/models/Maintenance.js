const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: String,
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
