const express = require("express");
const router = express.Router();
const Campus = require("../models/Campus");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.body.isMain) {
      await Campus.updateMany({}, { isMain: false });
    }
    const campus = await Campus.create(req.body);
    res.status(201).json(campus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const campuses = await Campus.find().sort({ isMain: -1, name: 1 });
    res.json(campuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.body.isMain) {
      await Campus.updateMany({ _id: { $ne: req.params.id } }, { isMain: false });
    }
    const campus = await Campus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campus) return res.status(404).json({ message: "Campus not found." });
    res.json(campus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Campus.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
