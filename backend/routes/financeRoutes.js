const express = require("express");
const router = express.Router();
const Fee = require("../models/Fee");
const Expense = require("../models/Expense");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.use(verifyToken);
router.use(verifyRole(["Admin", "Finance"]));

// --- Fees ---
router.post("/fees", async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/fees", async (req, res) => {
  try {
    const fees = await Fee.find().populate("student", "name studentId grade").sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/fees/:id", async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Expenses ---
router.post("/expenses", async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, recordedBy: req.user.id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().populate("recordedBy", "name").sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/expenses/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
