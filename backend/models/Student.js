const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, default: "student123" },
    grade: { type: String, required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
    status: { type: String, enum: ["Active", "Suspended", "Graduated"], default: "Active" },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true, trim: true },
    dob: { type: String, required: true },
    grades: {
      math: { type: String, default: "A" },
      science: { type: String, default: "A" },
      english: { type: String, default: "A" },
      history: { type: String, default: "A" }
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a unique studentId if not already present, and hash password
studentSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (this.studentId) return;

  const model = this.constructor;
  let isUnique = false;
  let generatedId = "";

  // Retry loop in case of rare random ID collisions
  while (!isUnique) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    generatedId = `STD-2026-${randomNum}`;
    const existing = await model.findOne({ studentId: generatedId });
    if (!existing) {
      isUnique = true;
    }
  }

  this.studentId = generatedId;
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);