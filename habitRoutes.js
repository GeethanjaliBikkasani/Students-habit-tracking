const express = require("express");
const mongoose = require("mongoose");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// Fetch all habits belonging to the logged-in student
router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find({ studentId: req.studentId }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a habit
router.post("/", async (req, res) => {
  try {
    const { habitName, category, description, frequency } = req.body;
    if (!habitName || !category) {
      return res.status(400).json({ message: "Habit name and category are required." });
    }
    const habit = await Habit.create({
      studentId: req.studentId,
      habitName,
      category,
      description,
      frequency
    });
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a habit
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid habit ID." });
    }
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, studentId: req.studentId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ message: "Habit not found." });
    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a habit and its completion history
router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      studentId: req.studentId
    });
    if (!habit) return res.status(404).json({ message: "Habit not found." });
    await HabitLog.deleteMany({ habitId: habit._id, studentId: req.studentId });
    res.json({ message: "Habit deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
