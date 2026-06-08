const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
    capacity: { type: Number, default: 30, min: 1 },
    room: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);
