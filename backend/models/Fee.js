const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["Tuition", "Transport", "Library", "Other"], default: "Tuition" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },
    paymentDate: { type: Date },
    transactionId: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);
