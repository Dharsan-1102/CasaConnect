const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    apartment: { type: String },
    flat: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone_number: { type: String },
    block: { type: String },

    role: {
      type: String,
      enum: ["admin", "resident", "guard", "maintenance"],
      required: true,
    },

    resident_role: {
      type: String,
      enum: ["Owner", "Tenant"],
      required: function () {
        return this.role === "resident";
      },
    },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    shift_time: { type: String },
    specialization: { type: String },
    profile_photo_url: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
