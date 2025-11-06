const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
} = require("../controllers/announcementController");

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (Instructor/Admin)
router.post("/", auth, createAnnouncement);

// @route   GET /api/announcements
// @desc    Get all announcements (students & instructors see them)
// @access  Public
router.get("/", auth, getAnnouncements);

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Public
router.get("/:id", auth, getAnnouncementById);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Instructor/Admin)
router.delete("/:id", auth, deleteAnnouncement);

module.exports = router;
