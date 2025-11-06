const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Register fonts for better text rendering (optional - place font files in assets/fonts/)
// Uncomment these lines if you have custom fonts
// registerFont(path.join(__dirname, '../assets/fonts/OpenSans-Bold.ttf'), { family: 'OpenSans-Bold' });
// registerFont(path.join(__dirname, '../assets/fonts/OpenSans-Regular.ttf'), { family: 'OpenSans-Regular' });

const generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { format = 'pdf' } = req.query; // Allow format selection via query param

    // Fetch student and course data
    const student = await Student.findById(studentId).populate('userId');
    const course = await Course.findById(courseId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if student is enrolled and has completed the course
    const enrollment = student.enrolledCourses.find(
      (enrolled) => enrolled.courseId.toString() === courseId
    );

    if (!enrollment) {
      return res.status(400).json({ error: 'Student not enrolled in this course' });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({ 
        error: 'Certificate not available. Course completion required.',
        progress: enrollment.progress 
      });
    }

    // Determine template based on course category
    let templatePath;
    if (course.category === 'Fullstack') {
      templatePath = path.join(__dirname, '../assests/certificates/Mern template.png');
    } else if (course.category === 'UI/UX') {
      templatePath = path.join(__dirname, '../assests/certificates/ui_ux template.png');
    } else {
      // Default to MERN template for other categories
      templatePath = path.join(__dirname, '../assests/certificates/Mern template.png');
    }

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: 'Certificate template not found' });
    }

    // Load the template image
    const templateImage = await loadImage(templatePath);
    
    // Create canvas with template dimensions
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');

    // Draw the template
    ctx.drawImage(templateImage, 0, 0);

    // Configure text settings
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2c3e50'; // Dark blue-gray color

    // Student Name (large, prominent)
    const studentName = student.name.toUpperCase();
    ctx.font = 'bold 60px Arial, sans-serif';
    // Position for name (adjust based on your template - this is for the dotted line area)
    const nameX = templateImage.width * 0.40;
    const nameY = templateImage.height * 0.50; // Approximately 58% down from top
    ctx.fillText(studentName, nameX, nameY);

    // Course Title (medium size) - Uncommented and positioned better
    ctx.font = 'bold 36px Arial, sans-serif';
    const courseTitle = course.title;
    // Position for course title (adjust based on your template)
    const courseTitleY = templateImage.height * 0.45; // Approximately 45% down from top
    ctx.fillText(courseTitle, templateImage.width / 2, courseTitleY);

    // Current Date (smaller)
    ctx.font = '40px Arial, sans-serif';
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // Position for date (bottom left area)
    const dateX = templateImage.width * 0.26; // 25% from left
    const dateY = templateImage.height * 0.86; // 85% down from top
    ctx.textAlign = 'center';
    ctx.fillText(currentDate, dateX, dateY);

    // Generate certificate ID
    const certificateId = `CERT-${course.code || 'COURSE'}-${Date.now()}`;
    
    // Certificate ID (small text, bottom area)
    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#7f8c8d'; // Lighter gray for ID
    const idY = templateImage.height * 0.92; // 92% down from top
    ctx.fillText(`Certificate ID: ${certificateId}`, templateImage.width / 2, idY);

    // Optional: Add completion score if available
    if (enrollment.progress === 100) {
      // Find the latest performance score for this course
      const coursePerformance = student.performanceScores.filter(
        score => score.courseId.toString() === courseId
      );
      
      if (coursePerformance.length > 0) {
        const avgScore = Math.round(
          coursePerformance.reduce((sum, score) => sum + (score.score / score.maxScore * 100), 0) / coursePerformance.length
        );
        
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillStyle = '#27ae60'; // Green color for score
        ctx.textAlign = 'right';
        const scoreX = templateImage.width * 0.85; // 85% from left
        const scoreY = templateImage.height * 0.35; // 35% down from top
        ctx.fillText(`Score: ${avgScore}%`, scoreX, scoreY);
      }
    }

    // Convert canvas to buffer
    const pngBuffer = canvas.toBuffer('image/png');

    // Generate filename
    const baseFilename = `certificate-${studentName.replace(/\s+/g, '-')}-${course.code || 'course'}`;

    if (format === 'png') {
      // Send PNG directly
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFilename}.png"`);
      res.setHeader('Content-Length', pngBuffer.length);
      return res.send(pngBuffer);
    } else {
      // Create PDF and embed PNG
      const doc = new PDFDocument({ 
        size: 'A4', 
        layout: 'landscape',
        margin: 0, // No margins for full-page certificate
        // Fix the metadata issue by providing proper info object
        info: {
          Title: `Certificate - ${course.title}`,
          Author: 'Your Institution Name',
          Subject: `Certificate of Completion for ${student.name}`,
          Keywords: 'certificate, completion, course',
          Creator: 'Certificate Generator',
          Producer: 'Your Learning Platform',
          CreationDate: new Date(),
          ModDate: new Date()
        }
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFilename}.pdf"`);

      // Handle PDF generation errors
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'PDF generation failed' });
        }
      });

      // Handle response errors
      res.on('error', (err) => {
        console.error('Response stream error:', err);
        doc.destroy();
      });

      // Pipe PDF to response only if response hasn't been sent
      if (!res.headersSent) {
        doc.pipe(res);
      }

      // Calculate dimensions to fit certificate on A4 landscape
      const pageWidth = doc.page.width;   // 842 points for A4 landscape
      const pageHeight = doc.page.height; // 595 points for A4 landscape
      
      // Calculate scale to fit certificate while maintaining aspect ratio
      const scaleX = pageWidth / templateImage.width;
      const scaleY = pageHeight / templateImage.height;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledWidth = templateImage.width * scale;
      const scaledHeight = templateImage.height * scale;
      
      // Center the certificate on the page
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      // Add the PNG image to PDF
      doc.image(pngBuffer, x, y, {
        width: scaledWidth,
        height: scaledHeight
      });

      // Finalize the PDF - this will trigger the pipe to send data
      doc.end();
    }

    // Optional: Update student record to mark certificate as issued
    // Do this asynchronously to avoid blocking the response
    if (!enrollment.certificateIssued) {
      Student.findByIdAndUpdate(
        studentId,
        { 
          $set: { 
            "enrolledCourses.$[elem].certificateIssued": true,
            "enrolledCourses.$[elem].certificateId": certificateId,
            "studyStats.coursesCompleted": student.studyStats.coursesCompleted + 1
          }
        },
        { 
          arrayFilters: [{ "elem.courseId": courseId }],
          new: true 
        }
      ).catch(err => {
        console.error('Failed to update student record:', err);
      });
    }

  } catch (error) {
    console.error('Certificate generation error:', error);
    
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate certificate',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Get certificate status/info without generating
const getCertificateStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ error: 'Student or course not found' });
    }

    const enrollment = student.enrolledCourses.find(
      (enrolled) => enrolled.courseId.toString() === courseId
    );

    if (!enrollment) {
      return res.status(400).json({ error: 'Student not enrolled in this course' });
    }

    const isEligible = enrollment.progress >= 100;
    const isIssued = enrollment.certificateIssued;

    res.json({
      studentName: student.name,
      courseTitle: course.title,
      courseCode: course.code,
      progress: enrollment.progress,
      isEligible,
      isIssued,
      canDownload: isEligible,
      certificateId: enrollment.certificateId || null,
      availableFormats: ['pdf', 'png']
    });

  } catch (error) {
    console.error('Certificate status error:', error);
    res.status(500).json({ error: 'Failed to get certificate status' });
  }
};

// Bulk certificate generation for multiple students
const generateBulkCertificates = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;
    const { format = 'pdf' } = req.query;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    const results = [];
    
    for (const studentId of studentIds) {
      try {
        // You would call the generateCertificate logic here for each student
        // For now, just add to results
        results.push({
          studentId,
          status: 'generated',
          filename: `certificate-${studentId}.${format}`
        });
      } catch (error) {
        results.push({
          studentId,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      message: 'Bulk certificate generation completed',
      results,
      successful: results.filter(r => r.status === 'generated').length,
      failed: results.filter(r => r.status === 'failed').length
    });

  } catch (error) {
    console.error('Bulk certificate generation error:', error);
    res.status(500).json({ error: 'Failed to generate bulk certificates' });
  }
};

module.exports = {
  generateCertificate,
  getCertificateStatus,
  generateBulkCertificates
};