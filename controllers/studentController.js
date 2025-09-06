const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const config = require('../config/default.json');
const generateStudentID = require('../utils/generateStudentId');
const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

// @desc    Create student profile after user signup
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const {
      userId,
      name,
      category,
      level,
      program,
      department,
      specialization,
      institution,
      occupation
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if student profile already exists for this user
    const existingStudent = await Student.findOne({ userId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student profile already exists for this user'
      });
    }

    // Create new student
    let savedStudent ;
    let studentId;
    for (let i = 0; i < 5; i++){
      studentId = await generateStudentID();
      try{
      const student = new Student({
      userId,
      studentId,
      name,
      category,
      level,
      program,
      department,
      specialization,
      institution,
      occupation
    });
    if (req.body.uploadedUrls?.photo) {
      const s3PhotoUrl = req.body.uploadedUrls.photo;
      student.photo = s3PhotoUrl;
    }

   savedStudent = await student.save();

    // Update user's profileUpdated status
    await User.findByIdAndUpdate(userId, { profileUpdated: true });
    break;
      }catch(err){
        if (err.code === 11000 && err.keyValue?.studentId) {
          console.log('Duplicate studentId, retrying...');
          continue;
        } else {
          throw err;
        }
      }
    }
    if (!savedStudent) {
      throw new Error('Failed to generate unique Student ID after multiple attempts');
    }


    res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      data: savedStudent
    });

  } catch (error) {
    // Handle duplicate studentId error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating student profile',
      error: error.message
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, department, program } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (program) filter.program = program;

    const students = await Student.find(filter)
      .populate('userId', 'email role isVerified')
      .populate('enrolledCourses.courseId', 'title code category')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: students
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email role isVerified lastSeen isOnline')
      .populate('enrolledCourses.courseId', 'title code description category instructors')
      .populate('performanceScores.courseId', 'title code')
      .populate('assignments.courseId', 'title code');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const {
      name,
      category,
      level,
      program,
      department,
      specialization,
      institution,
      occupation,
      notes,
      reminders
    } = req.body;

    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update fields
    if (name) student.name = name;
    if (category) student.category = category;
    if (level !== undefined) student.level = level;
    if (program) student.program = program;
    if (department) student.department = department;
    if (specialization) student.specialization = specialization;
    if (institution) student.institution = institution;
    if (occupation) student.occupation = occupation;
    if (notes) student.notes = notes;
    if (reminders) student.reminders = reminders;
    
    if (req.body.uploadedUrls?.photo) {
      const s3PhotoUrl = req.body.uploadedUrls.photo;
      student.photo = s3PhotoUrl;

      // Optionally delete old image from S3
      const existingStudent = await Student.findOne({ user: req.user.id });
      if (existingStudent?.photo) {
        const oldKey = existingStudent.photo.split('/').pop();
        await s3.send(new DeleteObjectCommand({
          Bucket: config.AWS_BUCKET_NAME,
          Key: oldKey
        }));
      }
    }

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message
    });
  }
};

// @desc    Delete student profile
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove student from all enrolled courses
    for (const enrollment of student.enrolledCourses) {
      await Course.findByIdAndUpdate(
        enrollment.courseId,
        { $pull: { enrolledStudents: student._id } }
      );
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student profile deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student profile',
      error: error.message
    });
  }
};

// @desc    Get student by user ID
// @route   GET /api/students/user/:userId
// @access  Private
const getStudentByUserId = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.userId })
      .populate('userId', 'email role isVerified')
      .populate('enrolledCourses.courseId', 'title code category');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student profile',
      error: error.message
    });
  }
};

// @desc    Add performance score
// @route   POST /api/students/:id/performance
// @access  Private
const addPerformanceScore = async (req, res) => {
  try {
    const { courseId, score } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.performanceScores.push({
      courseId,
      score,
      date: new Date()
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Performance score added successfully',
      data: student.performanceScores
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding performance score',
      error: error.message
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/students/:id/progress/:courseId
// @access  Private
const updateCourseProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const enrollment = student.enrolledCourses.find(
      course => course.courseId.toString() === req.params.courseId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    enrollment.progress = progress;
    
    // Issue certificate if progress is 100%
    if (progress === 100 && !enrollment.certificateIssued) {
      enrollment.certificateIssued = true;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: enrollment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByUserId,
  addPerformanceScore,
  updateCourseProgress
};