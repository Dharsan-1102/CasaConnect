const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  posterUrl: String,
  apartment: String,
  rsvp: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Event", eventSchema);
