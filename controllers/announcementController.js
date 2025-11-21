const Announcement = require("../models/Announcement");

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Instructor/Admin)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, author, course } = req.body;

    const announcement = new Announcement({
      title,
      message,
      author,
      course: course || null
    });

    const savedAnnouncement = await announcement.save();

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: savedAnnouncement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating announcement",
      error: error.message
    });
  }
};

// @desc    Get all announcements (latest first)
// @route   GET /api/announcements
// @access  Public (Students + Instructors)
const getAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.query;

    const filter = {};
    if (courseId) filter.course = courseId;

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message
    });
  }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcement",
      error: error.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Instructor/Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message
    });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
};
