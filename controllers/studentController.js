const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
// const config = require('../config/default.json');
const generateStudentID = require('../utils/generateStudentId');
const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
          Bucket: process.env.AWS_BUCKET_NAME,
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
      course => {
        if (!course || !course.courseId) return false;
        const enrollmentCourseId = course.courseId._id || course.courseId;
        return enrollmentCourseId.toString() === req.params.courseId;
      }
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
    console.error('updateCourseProgress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { courseId, moduleIndex, assignmentIndex, title, response, fileUrl } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is enrolled in course with null check
    const enrollment = student.enrolledCourses.find(
      course => {
        if (!course || !course.courseId) return false;
        const enrollmentCourseId = course.courseId._id || course.courseId;
        return enrollmentCourseId.toString() === courseId;
      }
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Check if assignment already exists, update or create new
    const existingAssignmentIndex = student.assignments.findIndex(
      assignment => 
        assignment &&
        assignment.courseId &&
        assignment.courseId.toString() === courseId &&
        assignment.moduleIndex === moduleIndex &&
        assignment.assignmentIndex === assignmentIndex
    );

    const assignmentData = {
      courseId,
      moduleIndex,
      assignmentIndex,
      title,
      response,
      fileUrl,
      status: 'submitted',
      submittedAt: new Date()
    };

    if (existingAssignmentIndex > -1) {
      // Update existing assignment
      student.assignments[existingAssignmentIndex] = {
        ...student.assignments[existingAssignmentIndex].toObject(),
        ...assignmentData
      };
    } else {
      // Add new assignment
      student.assignments.push(assignmentData);
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: assignmentData
    });

  } catch (error) {
    console.error('submitAssignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
};

// @desc    Get student assignments for a course
// @route   GET /api/student/:id/assignments/:courseId
// @access  Private
const getStudentAssignments = async (req, res) => {
  try {
    const { id: studentId, courseId } = req.params;

    const student = await Student.findById(studentId)
      .populate('assignments.courseId', 'title code');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Filter assignments for the specific course with null checks
    const courseAssignments = student.assignments.filter(
      assignment => {
        if (!assignment || !assignment.courseId) return false;
        const assignmentCourseId = assignment.courseId._id || assignment.courseId;
        return assignmentCourseId.toString() === courseId;
      }
    );

    res.status(200).json({
      success: true,
      data: courseAssignments
    });

  } catch (error) {
    console.error('getStudentAssignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};


// @desc    Submit quiz/assessment
// @route   POST /api/student/:id/quizzes
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { courseId, moduleIndex, quizTitle, answers, score } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add quiz to performance scores
    const quizScore = {
      courseId,
      moduleIndex,
      type: 'quiz',
      title: quizTitle,
      score,
      answers,
      date: new Date()
    };

    student.performanceScores.push(quizScore);
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: quizScore
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// @desc    Mark module as completed and update progress
// @route   PUT /api/student/:id/modules/complete
// @access  Private
const markModuleComplete = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find the course enrollment with null check
    const enrollmentIndex = student.enrolledCourses.findIndex(
      course => {
        if (!course || !course.courseId) return false;
        const enrollmentCourseId = course.courseId._id || course.courseId;
        return enrollmentCourseId.toString() === courseId;
      }
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Get course to know total modules
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Initialize or update completedModules array
    if (!student.enrolledCourses[enrollmentIndex].completedModules) {
      student.enrolledCourses[enrollmentIndex].completedModules = [];
    }

    const completedModules = student.enrolledCourses[enrollmentIndex].completedModules;

    // Add module to completed if not already there
    if (!completedModules.includes(moduleIndex)) {
      completedModules.push(moduleIndex);
    }

    // Calculate new progress percentage
    const totalModules = course.modules ? course.modules.length : 0;
    const completedCount = completedModules.length;
    const newProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    // Update progress
    student.enrolledCourses[enrollmentIndex].progress = newProgress;

    // Issue certificate if 100% complete
    if (newProgress === 100 && !student.enrolledCourses[enrollmentIndex].certificateIssued) {
      student.enrolledCourses[enrollmentIndex].certificateIssued = true;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Module marked as complete',
      data: {
        progress: newProgress,
        completedModules,
        certificateIssued: student.enrolledCourses[enrollmentIndex].certificateIssued
      }
    });

  } catch (error) {
    console.error('markModuleComplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating module completion',
      error: error.message
    });
  }
};

// @desc    Get detailed course progress
// @route   GET /api/student/:id/progress/:courseId/details
// @access  Private
const getCourseProgressDetails = async (req, res) => {
  try {
    const { id: studentId, courseId } = req.params;

    const student = await Student.findById(studentId)
      .populate('enrolledCourses.courseId', 'title code modules')
      .populate('performanceScores.courseId', 'title code')
      .populate('assignments.courseId', 'title code');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find enrollment details with null check
    const enrollment = student.enrolledCourses.find(
      course => {
        if (!course || !course.courseId) return false;
        const enrollmentCourseId = course.courseId._id || course.courseId;
        return enrollmentCourseId.toString() === courseId;
      }
    );

    if (!enrollment || !enrollment.courseId) {
      return res.status(404).json({
        success: false,
        message: 'Student not enrolled in this course'
      });
    }

    // Get course-specific assignments and performance scores with null checks
    const courseAssignments = student.assignments.filter(
      assignment => assignment && assignment.courseId && assignment.courseId.toString() === courseId
    );

    const coursePerformanceScores = student.performanceScores.filter(
      score => score && score.courseId && score.courseId.toString() === courseId
    );

    // Build detailed response with safe property access
    const progressDetails = {
      courseId,
      courseTitle: enrollment.courseId.title || 'Unknown Course',
      courseCode: enrollment.courseId.code || 'Unknown Code',
      overallProgress: enrollment.progress || 0,
      completedModules: enrollment.completedModules || [],
      certificateIssued: enrollment.certificateIssued || false,
      totalModules: enrollment.courseId.modules ? enrollment.courseId.modules.length : 0,
      assignments: courseAssignments,
      performanceScores: coursePerformanceScores,
      enrolledDate: enrollment.enrolledDate || student.createdAt
    };

    res.status(200).json({
      success: true,
      data: progressDetails
    });

  } catch (error) {
    console.error('getCourseProgressDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress details',
      error: error.message
    });
  }
};

// Update the existing updateCourseProgress to handle module completion
const updateCourseProgressEnhanced = async (req, res) => {
  try {
    const { progress, completedModules } = req.body;

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

    const enrollmentIndex = student.enrolledCourses.findIndex(
      course => {
        if (!course || !course.courseId) return false;
        const enrollmentCourseId = course.courseId._id || course.courseId;
        return enrollmentCourseId.toString() === req.params.courseId;
      }
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    // Update progress and completed modules
    student.enrolledCourses[enrollmentIndex].progress = progress;
    if (completedModules) {
      student.enrolledCourses[enrollmentIndex].completedModules = completedModules;
    }
    
    // Issue certificate if progress is 100%
    if (progress === 100 && !student.enrolledCourses[enrollmentIndex].certificateIssued) {
      student.enrolledCourses[enrollmentIndex].certificateIssued = true;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress,
        completedModules: student.enrolledCourses[enrollmentIndex].completedModules,
        certificateIssued: student.enrolledCourses[enrollmentIndex].certificateIssued
      }
    });

  } catch (error) {
    console.error('updateCourseProgressEnhanced error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// @desc    Add a new note
// @route   POST /api/students/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { title, subject, content, pages, starred } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const newNote = {
      title,
      subject,
      content,
      pages,
      starred: starred || false,
      lastModified: new Date()
    };

    student.notes.push(newNote);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: student.notes[student.notes.length - 1] // return the newly added note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding note", error: error.message });
  }
};

// @desc    Update an existing note
// @route   PUT /api/students/:id/notes/:noteId
// @access  Private
const updateNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const note = student.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    Object.assign(note, req.body, { lastModified: new Date() });
    await student.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating note", error: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/students/:id/notes/:noteId
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Check if note exists
    const note = student.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

  
    student.notes.pull({ _id: noteId });
    await student.save();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting note",
      error: error.message
    });
  }
};


// @desc    Get all notes for a student
// @route   GET /api/students/:id/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("notes");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      count: student.notes.length,
      data: student.notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notes", error: error.message });
  }
};

// @desc    Get a single note
// @route   GET /api/students/:id/notes/:noteId
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const student = await Student.findById(id).select("notes");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const note = student.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching note", error: error.message });
  }
};

// @desc    Get student statistics summary
// @route   GET /api/student/:id/stats
// @access  Private
const getStudentStats = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('enrolledCourses.courseId', 'title code modules')
      .populate('performanceScores.courseId', 'title')
      .populate('assignments.courseId', 'title');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate comprehensive stats
    const enrolledCourses = student.enrolledCourses || [];
    const completedCourses = enrolledCourses.filter(course => course.progress === 100);
    const performanceScores = student.performanceScores || [];
    const assignments = student.assignments || [];

    // Calculate average scores by type
    const quizScores = performanceScores.filter(score => score.type === 'quiz');
    const assignmentScores = performanceScores.filter(score => score.type === 'assignment');
    
    const avgQuizScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + (score.score || 0), 0) / quizScores.length
      : 0;

    const avgAssignmentScore = assignmentScores.length > 0
      ? assignmentScores.reduce((sum, score) => sum + (score.score || 0), 0) / assignmentScores.length
      : 0;

    // Calculate completion rates
    const totalModules = enrolledCourses.reduce((sum, course) => {
      return sum + (course.courseId?.modules?.length || 0);
    }, 0);

    const completedModules = enrolledCourses.reduce((sum, course) => {
      return sum + (course.completedModules?.length || 0);
    }, 0);

    const moduleCompletionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

    // Assignment submission rate
    const submittedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
    const totalAssignments = assignments.length;
    const assignmentSubmissionRate = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 100;

    const stats = {
      overview: {
        totalCoursesEnrolled: enrolledCourses.length,
        coursesCompleted: completedCourses.length,
        courseCompletionRate: enrolledCourses.length > 0 ? (completedCourses.length / enrolledCourses.length) * 100 : 0,
        totalModules,
        completedModules,
        moduleCompletionRate: Math.round(moduleCompletionRate)
      },
      performance: {
        averageQuizScore: Math.round(avgQuizScore),
        averageAssignmentScore: Math.round(avgAssignmentScore),
        totalQuizzesTaken: quizScores.length,
        totalAssignmentsSubmitted: submittedAssignments,
        assignmentSubmissionRate: Math.round(assignmentSubmissionRate)
      },
      studyMetrics: {
        ...student.studyStats,
        totalStudyHours: Math.round((student.studyStats?.totalStudyTime || 0) / 60),
        averageSessionHours: Math.round((student.studyStats?.averageSessionTime || 0) / 60 * 10) / 10
      },
      recentActivity: {
        lastLogin: student.lastLogin,
        recentAssignments: assignments
          .filter(a => a.submittedAt)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .slice(0, 5),
        recentQuizzes: performanceScores
          .filter(score => score.type === 'quiz')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('getStudentStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: error.message
    });
  }
};

// @desc    Get weekly activity data
// @route   GET /api/student/:id/activity/weekly
// @access  Private
const getWeeklyActivity = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get current week's start and end dates
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    // Get assignments and quizzes from this week
    const weeklyAssignments = student.assignments.filter(assignment => {
      return assignment.submittedAt && 
             new Date(assignment.submittedAt) >= startOfWeek && 
             new Date(assignment.submittedAt) <= endOfWeek;
    });

    const weeklyQuizzes = student.performanceScores.filter(score => {
      return score.date && 
             new Date(score.date) >= startOfWeek && 
             new Date(score.date) <= endOfWeek;
    });

    // Calculate activity for each day
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyActivity = daysOfWeek.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);

      // Count activities for this day
      const dayAssignments = weeklyAssignments.filter(assignment => {
        const assignmentDate = new Date(assignment.submittedAt);
        return assignmentDate.toDateString() === dayDate.toDateString();
      });

      const dayQuizzes = weeklyQuizzes.filter(score => {
        const scoreDate = new Date(score.date);
        return scoreDate.toDateString() === dayDate.toDateString();
      });

      // Estimate study hours based on activities
      // This is a rough estimate - you could enhance with actual time tracking
      const activityCount = dayAssignments.length + dayQuizzes.length;
      const estimatedHours = activityCount > 0 
        ? Math.min(5, Math.max(0.5, activityCount * 0.8 + Math.random() * 1.5))
        : 0;

      return {
        day,
        date: dayDate.toISOString().split('T')[0],
        hours: Math.round(estimatedHours * 10) / 10,
        completed: activityCount > 0,
        activitiesCount: activityCount,
        assignments: dayAssignments.length,
        quizzes: dayQuizzes.length
      };
    });

    res.status(200).json({
      success: true,
      data: {
        weekRange: {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        },
        weeklyActivity,
        weeklyTotals: {
          totalHours: weeklyActivity.reduce((sum, day) => sum + day.hours, 0),
          totalActivities: weeklyActivity.reduce((sum, day) => sum + day.activitiesCount, 0),
          activeDays: weeklyActivity.filter(day => day.completed).length
        }
      }
    });

  } catch (error) {
    console.error('getWeeklyActivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly activity',
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
  updateCourseProgress,
  submitAssignment,
  getStudentAssignments,
  submitQuiz,
  markModuleComplete,
  getCourseProgressDetails,
  updateCourseProgress: updateCourseProgressEnhanced,
  addNote,
  updateNote,
  deleteNote,
  getNotes,
  getNoteById,
  getStudentStats,
  getWeeklyActivity,
};