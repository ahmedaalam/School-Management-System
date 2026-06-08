const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");
const { verifyToken } = require("../middleware/authMiddleware");

const populateOpts = [
  { path: "section", select: "name grade" },
  { path: "subject", select: "name code color" },
  { path: "campus", select: "name code" },
];

router.post("/", verifyToken, async (req, res) => {
  try {
    const slot = await Timetable.create(req.body);
    const populated = await Timetable.findById(slot._id).populate(populateOpts);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.query.section) filter.section = req.query.section;
    if (req.query.campus) filter.campus = req.query.campus;

    const slots = await Timetable.find(filter)
      .populate(populateOpts)
      .sort({ dayOfWeek: 1, period: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate(populateOpts);
    if (!slot) return res.status(404).json({ message: "Timetable slot not found." });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
