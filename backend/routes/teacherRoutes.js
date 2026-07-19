const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

// Only Admin can manage teachers
router.use(verifyToken);
router.use(verifyRole(["Admin"]));

router.post("/", async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("subjects", "name code")
      .populate("sections", "name grade");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTeacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(updatedTeacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
