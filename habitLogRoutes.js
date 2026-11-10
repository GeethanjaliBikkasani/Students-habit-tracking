const express = require("express");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

function todayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// Get logs for a date (today by default)
router.get("/", async (req, res) => {
  try {
    const date = req.query.date || todayString();
    const logs = await HabitLog.find({ studentId: req.studentId, date });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/update completion status for a habit and date
router.post("/toggle", async (req, res) => {
  try {
    const { habitId, date, status } = req.body;
    if (!habitId || !date || typeof status !== "boolean") {
      return res.status(400).json({ message: "habitId, date and boolean status are required." });
    }
    const habit = await Habit.findOne({ _id: habitId, studentId: req.studentId });
    if (!habit) return res.status(404).json({ message: "Habit not found." });

    const log = await HabitLog.findOneAndUpdate(
      { habitId, studentId: req.studentId, date },
      { status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Dashboard progress and current streak for each habit
router.get("/progress", async (req, res) => {
  try {
    const habits = await Habit.find({ studentId: req.studentId });
    const logs = await HabitLog.find({ studentId: req.studentId, status: true }).sort({ date: -1 });
    const today = todayString();
    const completedToday = new Set(logs.filter((log) => log.date === today).map((log) => String(log.habitId)));

    const habitProgress = habits.map((habit) => {
      const dates = new Set(
        logs.filter((log) => String(log.habitId) === String(habit._id)).map((log) => log.date)
      );
      let streak = 0;
      const cursor = new Date(`${today}T00:00:00`);
      while (dates.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return {
        habitId: habit._id,
        habitName: habit.habitName,
        completedToday: completedToday.has(String(habit._id)),
        streak
      };
    });

    const total = habits.length;
    const completed = completedToday.size;
    res.json({
      totalHabits: total,
      completedToday: completed,
      pendingToday: Math.max(total - completed, 0),
      completionPercentage: total ? Math.round((completed / total) * 100) : 0,
      habits: habitProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
