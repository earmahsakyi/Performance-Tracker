const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentId: { type: String, unique: true },
  
  name: { type: String, required: true },
  category: { type: String, enum: ["Undergraduate", "Graduate", "NSS", "Other"], required: true },
  level: { type: Number }, 
  program: { type: String }, 
  department: { type: String }, 
  photo: { type: String, default: '' },
  specialization: { type: String }, 
  institution: { type: String },
  occupation: { type: String }, 

  enrolledCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      progress: { type: Number, default: 0 }, // 0 - 100%
      completedModules: [{ type: Number }], // Array of completed module indices
      certificateIssued: { type: Boolean, default: false },
      enrolledDate: { type: Date, default: Date.now }
    }
  ],

  performanceScores: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      moduleIndex: { type: Number }, // Which module this score belongs to
      type: { type: String, enum: ["quiz", "assignment", "exam", "project"], default: "assignment" },
      title: { type: String }, // Name of the quiz/assignment
      score: { type: Number }, // Score achieved
      maxScore: { type: Number, default: 100 }, // Maximum possible score
      answers: [mongoose.Schema.Types.Mixed], // For quizzes - store answers
      feedback: { type: String }, // Instructor feedback
      date: { type: Date, default: Date.now }
    }
  ],

  assignments: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      moduleIndex: { type: Number },
      assignmentIndex: { type: Number },
      title: { type: String },
      response: { type: String }, // Text response
      fileUrl: { type: String }, // File attachment URL
      status: { type: String, enum: ["submitted", "graded", "pending", "late"], default: "pending" },
      grade: { type: String },
      feedback: { type: String },
      submittedAt: { type: Date },
      gradedAt: { type: Date }
    }
  ],

  // Module completion tracking per course
  moduleCompletions: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      moduleIndex: { type: Number },
      completedAt: { type: Date, default: Date.now },
      timeSpent: { type: Number }, // Minutes spent on module
      resourcesViewed: [{ type: String }] // URLs of resources viewed
    }
  ],
 


  badges: [String], 
  attendance: [{ date: Date, sessionId: String }],
  lastLogin: { type: Date },
  activityPoints: { type: Number, default: 0 },

  // Study analytics
  studyStats: {
    totalStudyTime: { type: Number, default: 0 }, // Total minutes studied
    averageSessionTime: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    assignmentsSubmitted: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 }, // Days of consecutive activity
    longestStreak: { type: Number, default: 0 }
  },

  notes: [
  {
    title: String,
    subject: String,
    content: String,
    pages: Number,
    starred: { type: Boolean, default: false },
    lastModified: { type: Date, default: Date.now }
  }
],
  reminders: [{ text: String, dueDate: Date }],
  discussionPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
}, { timestamps: true });

// Methods to calculate progress
studentSchema.methods.calculateCourseProgress = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (!enrollment) return 0;
  return enrollment.progress || 0;
};

studentSchema.methods.getCompletedModules = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (!enrollment) return [];
  return enrollment.completedModules || [];
};

studentSchema.methods.getCourseAssignments = function(courseId) {
  return this.assignments.filter(
    assignment => assignment.courseId.toString() === courseId.toString()
  );
};

studentSchema.methods.getCoursePerformance = function(courseId) {
  return this.performanceScores.filter(
    score => score.courseId.toString() === courseId.toString()
  );
};

// Index for better query performance
studentSchema.index({ userId: 1 });

studentSchema.index({ 'enrolledCourses.courseId': 1 });

module.exports = mongoose.model('Student', studentSchema);