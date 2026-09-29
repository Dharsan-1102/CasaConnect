const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
  name: String,
  society_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
  total_blocks: Number,
  total_flats: Number,
});

module.exports = mongoose.model("Apartment", apartmentSchema);
