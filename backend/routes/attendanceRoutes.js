const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// All attendance routes are protected
router.use(verifyToken);
router.use(verifyRole(["Admin", "Teacher"]));

// Get attendance for a specific date
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date query parameter is required." });

    const records = await Attendance.find({ date }).populate("student", "name studentId grade");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark/Update attendance for a specific date (Bulk)
router.post("/bulk", async (req, res) => {
  try {
    const { date, records } = req.body;
    // records: [{ student: "id", status: "Present" }]
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const operations = records.map(record => ({
      updateOne: {
        filter: { student: record.student, date },
        update: { $set: { status: record.status, markedBy: req.user.id } },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    res.json({ message: "Attendance saved successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance history for a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
