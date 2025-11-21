const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      category,
      instructors,
      durationWeeks,
      startDate,
      endDate,
      modules,
      price,
      level,
      thumbnail,
      tags
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    // Validate instructors exist
    if (instructors && instructors.length > 0) {
      const validInstructors = await User.find({ 
        _id: { $in: instructors },
        role: { $in: ['Admin', 'Instructor'] }
      });
      
      if (validInstructors.length !== instructors.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more instructor IDs are invalid'
        });
      }
    }

    const course = new Course({
      title,
      code,
      description,
      category,
      instructors,
      durationWeeks,
      startDate,
      endDate,
      modules,
      price,
      level,
      thumbnail,
      tags
    });

    const savedCourse = await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: savedCourse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      isActive, 
      search,
      tags
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (tags) filter.tags = { $in: tags.split(',') };
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructors', 'email')
      .populate('enrolledStudents', 'name studentId')
      .select('-modules.assignments')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructors', 'email role')
      .populate('enrolledStudents', 'name studentId category program department');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      instructors,
      durationWeeks,
      startDate,
      endDate,
      modules,
      tags,
      price,
      level,
      thumbnail,
      isActive,
      announcements
    } = req.body;

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate instructors if provided
    if (instructors && instructors.length > 0) {
      const validInstructors = await User.find({ 
        _id: { $in: instructors },
        role: { $in: ['Admin', 'Instructor'] }
      });
      
      if (validInstructors.length !== instructors.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more instructor IDs are invalid'
        });
      }
    }

    // Update fields
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (category) course.category = category;
    if (instructors) course.instructors = instructors;
    if (durationWeeks) course.durationWeeks = durationWeeks;
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    if (modules) course.modules = modules;
    if (tags) course.tags = tags;
    if (isActive !== undefined) course.isActive = isActive;
    if (announcements) course.announcements = announcements;
    if (price) course.price = price;
    if (level) course.level = level;
    if (thumbnail) course.thumbnail = thumbnail;

    const updatedCourse = await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Remove course from all enrolled students
    await Student.updateMany(
      { 'enrolledCourses.courseId': course._id },
      { $pull: { enrolledCourses: { courseId: course._id } } }
    );

    // Also clean up performance scores and assignments related to this course
    await Student.updateMany(
      {},
      { 
        $pull: { 
          performanceScores: { courseId: course._id },
          assignments: { courseId: course._id }
        }
      }
    );

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:courseId/enroll
// @access  Private
const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId } = req.body;

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in inactive course'
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is already enrolled
    const alreadyEnrolled = student.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    // Check if student is already in course's enrolled students
    const alreadyInCourse = course.enrolledStudents.includes(studentId);
    
    // Add student to course enrollment
    if (!alreadyInCourse) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    // Add course to student enrollment
    const newEnrollment = {
      courseId: courseId,
      progress: 0,
      completedModules: [],
      certificateIssued: false,
      enrolledDate: new Date()
    };
    
    student.enrolledCourses.push(newEnrollment);
    const savedStudent = await student.save();

    // Instead of trying to find the enrollment after population,
    // just get the last enrollment which is the one we just added
    const lastEnrollmentIndex = savedStudent.enrolledCourses.length - 1;
    const justAddedEnrollment = savedStudent.enrolledCourses[lastEnrollmentIndex];

    // Return response without problematic population
    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: {
        course: {
          id: course._id,
          title: course.title,
          code: course.code,
          category: course.category
        },
        student: {
          id: student._id,
          name: student.name,
          studentId: student.studentId
        },
        enrollment: {
          courseId: justAddedEnrollment.courseId,
          progress: justAddedEnrollment.progress,
          completedModules: justAddedEnrollment.completedModules,
          certificateIssued: justAddedEnrollment.certificateIssued,
          enrolledDate: justAddedEnrollment.enrolledDate,
          _id: justAddedEnrollment._id
        }
      }
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error enrolling student',
      error: error.message
    });
  }
};


// @desc    Unenroll student from course
// @route   DELETE /api/courses/:courseId/unenroll/:studentId
// @access  Private
const unenrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Find course and student
    const [course, student] = await Promise.all([
      Course.findById(courseId),
      Student.findById(studentId)
    ]);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== studentId
    );

    // Remove course from student
    student.enrolledCourses = student.enrolledCourses.filter(
      enrollment => enrollment.courseId.toString() !== courseId
    );

    // Remove related performance scores and assignments
    student.performanceScores = student.performanceScores.filter(
      score => score.courseId.toString() !== courseId
    );
    student.assignments = student.assignments.filter(
      assignment => assignment.courseId.toString() !== courseId
    );

    await Promise.all([course.save(), student.save()]);

    res.status(200).json({
      success: true,
      message: 'Student unenrolled successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unenrolling student',
      error: error.message
    });
  }
};

// @desc    Get all students enrolled in a course
// @route   GET /api/courses/:id/students
// @access  Private
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'enrolledStudents',
        select: 'name studentId category program department enrolledCourses',
        populate: {
          path: 'enrolledCourses.courseId',
          select: 'title code'
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment details for this specific course
    const studentsWithProgress = course.enrolledStudents.map(student => {
      const enrollment = student.enrolledCourses.find(
        e => e.courseId._id.toString() === req.params.id
      );
      
      return {
        ...student.toObject(),
        progress: enrollment ? enrollment.progress : 0,
        certificateIssued: enrollment ? enrollment.certificateIssued : false
      };
    });

    res.status(200).json({
      success: true,
      count: studentsWithProgress.length,
      data: studentsWithProgress
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course students',
      error: error.message
    });
  }
};

// @desc    Add announcement to course
// @route   POST /api/courses/:id/announcements
// @access  Private (Admin/Instructor)
const addCourseAnnouncement = async (req, res) => {
  try {
    const { title, body } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.announcements.push({
      title,
      body,
      date: new Date()
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Announcement added successfully',
      data: course.announcements
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding announcement',
      error: error.message
    });
  }
};

// @desc    Get course modules
// @route   GET /api/courses/:id/modules
// @access  Private (Enrolled students/Instructors)
const getCourseModules = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('modules title code');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        courseCode: course.code,
        modules: course.modules
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course modules',
      error: error.message
    });
  }
};

// @desc    Update specific module
// @route   PUT /api/courses/:id/modules/:moduleIndex
// @access  Private (Admin/Instructor)
const updateCourseModule = async (req, res) => {
  try {
    const { moduleIndex } = req.params;
    const { title, description, resources, assignments } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.modules[moduleIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update module fields
    if (title) course.modules[moduleIndex].title = title;
    if (description !== undefined) course.modules[moduleIndex].description = description;
    if (resources) course.modules[moduleIndex].resources = resources;
    if (assignments) course.modules[moduleIndex].assignments = assignments;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: course.modules[moduleIndex]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating module',
      error: error.message
    });
  }
};

// @desc    Add new module to course
// @route   POST /api/courses/:id/modules
// @access  Private (Admin/Instructor)
const addCourseModule = async (req, res) => {
  try {
    const { title, description, resources, assignments } = req.body;
    //check if the user is an admin or instructor
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'Admin' && user.role !== 'Instructor')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Module title is required'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create new module object
    const newModule = {
      title,
      description: description || '',
      resources: resources || [],
      assignments: assignments || []
    };

    // Add to modules array
    course.modules.push(newModule);
    await course.save();

    // Get the newly added module (last item in array)
    const addedModule = course.modules[course.modules.length - 1];

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      data: {
        module: addedModule,
        moduleIndex: course.modules.length - 1,
        totalModules: course.modules.length
      }
    });

  } catch (error) {
    console.error('Add module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message
    });
  }
};

// @desc    Delete module from course
// @route   DELETE /api/courses/:id/modules/:moduleIndex
// @access  Private (Admin/Instructor)
const deleteCourseModule = async (req, res) => {
  try {
    const { moduleIndex } = req.params;
    const moduleIdx = parseInt(moduleIndex);

    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'Admin' && user.role !== 'Instructor')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.modules[moduleIdx]) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get module title before deletion for response
    const deletedModuleTitle = course.modules[moduleIdx].title;

    // Remove module from array
    course.modules.splice(moduleIdx, 1);
    await course.save();

    // Clean up student data related to this module
    // Remove completed module tracking
    await Student.updateMany(
      { 'enrolledCourses.courseId': course._id },
      { 
        $pull: { 
          'enrolledCourses.$[enrollment].completedModules': moduleIdx 
        }
      },
      { 
        arrayFilters: [{ 'enrollment.courseId': course._id }] 
      }
    );

    // Update module indices in completedModules (decrement all indices > deleted index)
    await Student.updateMany(
      { 'enrolledCourses.courseId': course._id },
      { 
        $inc: { 
          'enrolledCourses.$[enrollment].completedModules.$[moduleNum]': -1 
        }
      },
      { 
        arrayFilters: [
          { 'enrollment.courseId': course._id },
          { 'moduleNum': { $gt: moduleIdx } }
        ]
      }
    );

    // Clean up performance scores for this module
    await Student.updateMany(
      { 
        'performanceScores.courseId': course._id,
        'performanceScores.moduleIndex': moduleIdx
      },
      { 
        $pull: { 
          performanceScores: { 
            courseId: course._id, 
            moduleIndex: moduleIdx 
          } 
        }
      }
    );

    // Update module indices in performance scores
    await Student.updateMany(
      { 
        'performanceScores.courseId': course._id,
        'performanceScores.moduleIndex': { $gt: moduleIdx }
      },
      { 
        $inc: { 
          'performanceScores.$[score].moduleIndex': -1 
        }
      },
      { 
        arrayFilters: [
          { 
            'score.courseId': course._id,
            'score.moduleIndex': { $gt: moduleIdx }
          }
        ]
      }
    );

    // Clean up assignments for this module
    await Student.updateMany(
      { 
        'assignments.courseId': course._id,
        'assignments.moduleIndex': moduleIdx
      },
      { 
        $pull: { 
          assignments: { 
            courseId: course._id, 
            moduleIndex: moduleIdx 
          } 
        }
      }
    );

    // Update module indices in assignments
    await Student.updateMany(
      { 
        'assignments.courseId': course._id,
        'assignments.moduleIndex': { $gt: moduleIdx }
      },
      { 
        $inc: { 
          'assignments.$[assignment].moduleIndex': -1 
        }
      },
      { 
        arrayFilters: [
          { 
            'assignment.courseId': course._id,
            'assignment.moduleIndex': { $gt: moduleIdx }
          }
        ]
      }
    );

    res.status(200).json({
      success: true,
      message: `Module "${deletedModuleTitle}" deleted successfully`,
      data: {
        deletedModuleIndex: moduleIdx,
        remainingModules: course.modules.length
      }
    });

  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting module',
      error: error.message
    });
  }
};

// @desc    Reorder course modules
// @route   PUT /api/courses/:id/modules/reorder
// @access  Private (Admin/Instructor)
const reorderCourseModules = async (req, res) => {
  try {
    const { newOrder } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'Admin' && user.role !== 'Instructor')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!Array.isArray(newOrder)) {
      return res.status(400).json({
        success: false,
        message: 'newOrder must be an array of module indices'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate newOrder array
    if (newOrder.length !== course.modules.length) {
      return res.status(400).json({
        success: false,
        message: 'newOrder array length must match number of modules'
      });
    }

    // Check if all indices are valid
    const validIndices = newOrder.every(
      idx => Number.isInteger(idx) && idx >= 0 && idx < course.modules.length
    );

    if (!validIndices) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module indices in newOrder array'
      });
    }

    // Check for duplicate indices
    const uniqueIndices = new Set(newOrder);
    if (uniqueIndices.size !== newOrder.length) {
      return res.status(400).json({
        success: false,
        message: 'newOrder array contains duplicate indices'
      });
    }

    // Create mapping of old index to new index
    const indexMapping = {};
    newOrder.forEach((oldIndex, newIndex) => {
      indexMapping[oldIndex] = newIndex;
    });

    // Reorder modules
    const reorderedModules = newOrder.map(oldIndex => course.modules[oldIndex]);
    course.modules = reorderedModules;
    await course.save();

    // Update student completed modules indices
    const students = await Student.find({ 
      'enrolledCourses.courseId': course._id 
    });

    for (const student of students) {
      let updated = false;

      student.enrolledCourses.forEach(enrollment => {
        if (enrollment.courseId.toString() === course._id.toString()) {
          // Remap completed module indices
          enrollment.completedModules = enrollment.completedModules.map(
            oldIdx => indexMapping[oldIdx]
          ).filter(idx => idx !== undefined);
          updated = true;
        }
      });

      // Update performance scores module indices
      student.performanceScores.forEach(score => {
        if (score.courseId.toString() === course._id.toString()) {
          score.moduleIndex = indexMapping[score.moduleIndex];
          updated = true;
        }
      });

      // Update assignments module indices
      student.assignments.forEach(assignment => {
        if (assignment.courseId.toString() === course._id.toString()) {
          assignment.moduleIndex = indexMapping[assignment.moduleIndex];
          updated = true;
        }
      });

      // Update module completions
      student.moduleCompletions.forEach(completion => {
        if (completion.courseId.toString() === course._id.toString()) {
          completion.moduleIndex = indexMapping[completion.moduleIndex];
          updated = true;
        }
      });

      if (updated) {
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Modules reordered successfully',
      data: {
        modules: course.modules,
        totalModules: course.modules.length
      }
    });

  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering modules',
      error: error.message
    });
  }
};


// @desc    Get single module by index
// @route   GET /api/courses/:id/modules/:moduleIndex
// @access  Private (Enrolled students/Instructors)
const getCourseModule = async (req, res) => {
  try {
    const { moduleIndex } = req.params;
    const moduleIdx = parseInt(moduleIndex);
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'Admin' && user.role !== 'Instructor')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const course = await Course.findById(req.params.id).select('modules title code');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.modules[moduleIdx]) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        courseCode: course.code,
        moduleIndex: moduleIdx,
        module: course.modules[moduleIdx],
        totalModules: course.modules.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching module',
      error: error.message
    });
  }
};



// @desc    Advanced course search
// @route   GET /api/courses/search/advanced
// @access  Public
const advancedCourseSearch = async (req, res) => {
  try {
    const {
      q,           // search query
      category,
      tags,
      instructorId,
      startDate,
      endDate,
      minDuration,
      maxDuration,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage
    const matchStage = {};
    
    if (q) {
      matchStage.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) matchStage.category = category;
    if (tags) matchStage.tags = { $in: tags.split(',') };
    if (instructorId) matchStage.instructors = instructorId;
    if (isActive !== undefined) matchStage.isActive = isActive === 'true';
    
    // Date range filters
    if (startDate || endDate) {
      matchStage.startDate = {};
      if (startDate) matchStage.startDate.$gte = new Date(startDate);
      if (endDate) matchStage.startDate.$lte = new Date(endDate);
    }
    
    // Duration filters
    if (minDuration || maxDuration) {
      matchStage.durationWeeks = {};
      if (minDuration) matchStage.durationWeeks.$gte = parseInt(minDuration);
      if (maxDuration) matchStage.durationWeeks.$lte = parseInt(maxDuration);
    }

    pipeline.push({ $match: matchStage });

    // Add lookup for instructors and enrolled students count
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'instructors',
          foreignField: '_id',
          as: 'instructorDetails'
        }
      },
      {
        $addFields: {
          enrolledCount: { $size: '$enrolledStudents' },
          instructorNames: '$instructorDetails.email'
        }
      }
    );

    // Sort stage
    const sortStage = {};
    sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortStage });

    // Execute aggregation with pagination
    const [results, totalCount] = await Promise.all([
      Course.aggregate([
        ...pipeline,
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ]),
      Course.aggregate([...pipeline, { $count: 'total' }])
    ]);

    const total = totalCount[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing advanced search',
      error: error.message
    });
  }
};



module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getCourseStudents,
  addCourseAnnouncement,
  getCourseModules,
  updateCourseModule,
  advancedCourseSearch,
   addCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  getCourseModule
};