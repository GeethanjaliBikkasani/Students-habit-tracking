const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    habitName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    frequency: { type: String, enum: ["Daily", "Weekly"], default: "Daily" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);
