const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes protected by JWT
// Create
router.post("/", verifyToken, async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error("POST /users error:", err);
        res.status(400).json({ message: err.message });
    }
});

// Read all
router.get("/", verifyToken, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("GET /users error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Update
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "User not found." });
        res.json(updatedUser);
    } catch (err) {
        console.error("PUT /users/:id error:", err);
        res.status(400).json({ message: err.message });
    }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully." });
    } catch (err) {
        console.error("DELETE /users/:id error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;