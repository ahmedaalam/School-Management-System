const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const { verifyToken } = require("../middleware/authMiddleware");

// Helper: generate JWT
const generateToken = (id, name, email, role) => {
  return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ── POST /auth/register ──────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const admin = await Admin.create({ name, email, password });
    const token = generateToken(admin._id, admin.name, admin.email, "Admin");

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: "Admin" },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    let user = null;
    let role = null;

    // Check all collections
    const admin = await Admin.findOne({ email });
    if (admin) { user = admin; role = "Admin"; }
    else {
      const teacher = await Teacher.findOne({ email });
      if (teacher) { user = teacher; role = "Teacher"; }
      else {
        const student = await Student.findOne({ email });
        if (student) { user = student; role = "Student"; }
        else {
          const parent = await Parent.findOne({ email });
          if (parent) { user = parent; role = "Parent"; }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id, user.name, user.email, role);

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;

    if (role === "Admin") user = await Admin.findById(id).select("-password");
    else if (role === "Teacher") user = await Teacher.findById(id).select("-password");
    else if (role === "Student") user = await Student.findById(id).select("-password");
    else if (role === "Parent") user = await Parent.findById(id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    
    // Convert Mongoose doc to plain object and add role
    const userData = user.toObject();
    userData.role = role;

    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
