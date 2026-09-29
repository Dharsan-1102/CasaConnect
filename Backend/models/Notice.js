const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  message: String,
  date: { type: Date, default: Date.now },
  postedBy: String,
  apartment: String,
});

module.exports = mongoose.model("Notice", noticeSchema);
