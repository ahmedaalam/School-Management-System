const express = require("express");
const router = express.Router();
const Section = require("../models/Section");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, async (req, res) => {
  try {
    const section = await Section.create(req.body);
    const populated = await Section.findById(section._id).populate("campus", "name code");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const sections = await Section.find()
      .populate("campus", "name code")
      .sort({ grade: 1, name: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("campus", "name code");
    if (!section) return res.status(404).json({ message: "Section not found." });
    res.json(section);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
