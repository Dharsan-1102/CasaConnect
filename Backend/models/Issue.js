const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
    index: true,
    unique: true,
  },
  resident_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming you have a User model
    required: true,
  },
  category: {
    type: String,
    enum: ["Plumbing", "Electrical", "Carpentry", "Other"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
    default: "Open",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

issueSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Issue", issueSchema);
