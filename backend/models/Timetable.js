const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    period: { type: Number, required: true, min: 1, max: 12 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, trim: true },
    teacherName: { type: String, trim: true },
  },
  { timestamps: true }
);

timetableSchema.index({ section: 1, dayOfWeek: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
