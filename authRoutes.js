const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();

function makeToken(student) {
  return jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must contain at least 6 characters." });
    }

    const existing = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "This email is already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email, password: hashedPassword });

    res.status(201).json({
      token: makeToken(student),
      student: { id: student._id, name: student.name, email: student.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email: (email || "").toLowerCase().trim() });
    if (!student || !(await bcrypt.compare(password || "", student.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    res.json({
      token: makeToken(student),
      student: { id: student._id, name: student.name, email: student.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
