// controllers/deadlineController.js
const Deadline = require('../models/Deadline');
const Student = require('../models/Student');

// Create a new deadline
const createDeadline = async (req, res) => {


   //check if the user is an instructor
   if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only instructors can create deadlines" });
  }


  try {
    const { title, courseId, courseName, date, priority } = req.body;
    const createdBy = req.user.id;
    const newDeadline = new Deadline({
      title,
      courseId,
      courseName,
      date,
      priority,
      createdBy
    });

    await newDeadline.save();
    res.status(201).json(newDeadline);
  } catch (error) {
    res.status(500).json({ message: "Error creating deadline", error: error.message });
  }
};

// Get deadlines for a student
const getDeadlinesForStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const courseIds = student.enrolledCourses.map(c => c.courseId);
    const deadlines = await Deadline.find({ courseId: { $in: courseIds } })
      .populate("courseId", "name")
      .sort({ date: 1 });

    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student deadlines", error: error.message });
  }
};

// Get deadlines created by instructor
const getDeadlinesByCreator = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ createdBy: req.user._id }).populate("courseId");
    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructor deadlines", error: error.message });
  }
};

// Update deadline
const updateDeadline = async (req, res) => {
  try {
    const { title, courseId, courseName, date, priority } = req.body;
    const updatedDeadline = await Deadline.findByIdAndUpdate(
      req.params.deadlineId,
      { title, courseId, courseName, date, priority },
      { new: true }
    );

    if (!updatedDeadline) return res.status(404).json({ message: "Deadline not found" });

    res.status(200).json(updatedDeadline);
  } catch (error) {
    res.status(500).json({ message: "Error updating deadline", error: error.message });
  }
};

// Delete deadline
const deleteDeadline = async (req, res) => {
  try {
    const deletedDeadline = await Deadline.findByIdAndDelete(req.params.deadlineId);
    if (!deletedDeadline) return res.status(404).json({ message: "Deadline not found" });

    res.status(200).json({ message: "Deadline deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting deadline", error: error.message });
  }
};

// Get all deadlines
const getAllDeadlines = async (req, res) => {
  try {
    const deadlines = await Deadline.find().populate("courseId", "title code");
    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all deadlines", error: error.message });
  }
};

//get all deadlines for a course
const getDeadlinesByCourse = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ courseId: req.params.courseId }).populate("courseId", "title code");
    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all deadlines", error: error.message });
  }
};

// Export all
module.exports = {
  createDeadline,
  getDeadlinesForStudent,
  getDeadlinesByCreator,
  updateDeadline,
  deleteDeadline,
  getAllDeadlines,
  getDeadlinesByCourse,
};