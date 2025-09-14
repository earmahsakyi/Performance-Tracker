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
      resources: [ {
          type: mongoose.Schema.Types.Mixed, // Allows both String and Object
          default: []
        }], 
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
  rating: { type: Number, default: 0 },
  price: { type: String, enum: ["Free", "Premium"], default: "Free" },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  thumbnail: { type: String, default:"bg-gradient-to-br from-purple-500 to-purple-600" },

  tags: [String], // e.g., ["JavaScript", "MongoDB", "Design Thinking"]

  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
