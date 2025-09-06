const Student = require('../models/Student');

async function generateStudentID () {
  const count = await Student.countDocuments();
  const nextNumber = 2025 + count;
  return `MERN${nextNumber}`;
}

module.exports = generateStudentID;
