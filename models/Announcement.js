const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  author: { type: String, required: true }, 
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false }, 
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
