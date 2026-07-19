const express = require("express");
const router = express.Router();
const Parent = require("../models/Parent");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// Only Admin can manage parents
router.use(verifyToken);
router.use(verifyRole(["Admin"]));

router.post("/", async (req, res) => {
  try {
    const parent = await Parent.create(req.body);
    res.status(201).json(parent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const parents = await Parent.find().populate("students", "name studentId grade");
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedParent) return res.status(404).json({ message: "Parent not found" });
    res.json(updatedParent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Parent.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
