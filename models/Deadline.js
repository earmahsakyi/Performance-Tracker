const  mongoose = require('mongoose')

const deadlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  courseName: { type: String, required: true },
  date: { type: Date, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Deadline", deadlineSchema);
