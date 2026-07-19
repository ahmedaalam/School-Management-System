const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Fee = require("../models/Fee");
const Expense = require("../models/Expense");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.use(verifyRole(["Admin", "Principal"])); // Optional Principal role for future

router.get("/summary", async (req, res) => {
  try {
    const [
      studentCount, 
      teacherCount, 
      parentCount,
      fees,
      expenses
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Parent.countDocuments(),
      Fee.find(),
      Expense.find()
    ]);

    const revenue = fees.filter(f => f.status === "Paid").reduce((acc, curr) => acc + curr.amount, 0);
    const pendingFees = fees.filter(f => f.status === "Unpaid").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Simulate some AI-based Insights (Could be hooked to real LLM in the future)
    const insights = [
      { type: "positive", text: "Revenue is up 12% compared to last month." },
      { type: "warning", text: `There are $${pendingFees.toLocaleString()} in pending fee collections.` },
      { type: "info", text: "Student-to-Teacher ratio is currently " + (teacherCount > 0 ? (studentCount / teacherCount).toFixed(1) : studentCount) + ":1." }
    ];

    res.json({
      counts: {
        students: studentCount,
        teachers: teacherCount,
        parents: parentCount
      },
      finance: {
        revenue,
        expenses: totalExpenses,
        pendingFees
      },
      insights
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
