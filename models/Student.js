const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: String, unique: true },
  
  name:{type:String, required: true},
  category: { type: String, enum: ["Undergraduate", "Graduate", "NSS", "Other"], required: true },
  level: { type: Number }, 
  program: { type: String }, 
  department: { type: String }, 
  photo: { type: String , default: ''},

  specialization: { type: String }, 
  institution: { type: String },
  occupation: { type: String }, 
    enrolledCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      progress: { type: Number, default: 0 }, // 0 - 100%
      certificateIssued: { type: Boolean, default: false }
    }
  ],

  performanceScores: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      score: Number,
      date: Date,
    }
  ],

  assignments: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      title: String,
      status: { type: String, enum: ["submitted", "graded", "pending"] },
      grade: String,
    }
  ],

  badges: [String], 
  attendance: [{ date: Date, sessionId: String }],
  lastLogin: { type: Date },
  activityPoints: { type: Number, default: 0 },

  notes: [String],
  reminders: [{ text: String, dueDate: Date }],
  discussionPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
