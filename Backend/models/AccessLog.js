const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
  entry_point: String,
  entry_time: Date,
  exit_time: Date,
});

module.exports = mongoose.model("AccessLog", accessLogSchema);
