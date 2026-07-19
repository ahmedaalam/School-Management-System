const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes protected by JWT
// Create
router.post("/", verifyToken, async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        console.error("POST /students error:", err);
        res.status(400).json({ message: err.message });
    }
});

// Read all
router.get("/", verifyToken, async (req, res) => {
    try {
        const students = await Student.find()
            .populate("section", "name grade")
            .populate("campus", "name code")
            .populate("parent", "name email")
            .sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        console.error("GET /students error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStudent) return res.status(404).json({ message: "Student not found." });
        res.json(updatedStudent);
    } catch (err) {
        console.error("PUT /students/:id error:", err);
        res.status(400).json({ message: err.message });
    }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully." });
    } catch (err) {
        console.error("DELETE /students/:id error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;