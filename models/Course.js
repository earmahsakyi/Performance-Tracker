const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Fullstack MERN Development"
  code: { type: String, unique: true, required: true }, // e.g., "MERN101"
  description: { type: String },
  category: { type: String, enum: ["Fullstack", "UI/UX", "General"], default: "General" },
  
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // you + your friend
  
  durationWeeks: { type: Number }, // e.g., 12 weeks
  startDate: { type: Date },
  endDate: { type: Date },

  modules: [
    {
      title: String, // e.g., "React Basics"
      description: String,
      resources: [String], // e.g., ["link to slides", "link to repo"]
      assignments: [
        {
          title: String,
          description: String,
          dueDate: Date,
        }
      ]
    }
  ],

  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

  // For tracking activity
  announcements: [
    {
      title: String,
      body: String,
      date: { type: Date, default: Date.now }
    }
  ],

  tags: [String], // e.g., ["JavaScript", "MongoDB", "Design Thinking"]

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
