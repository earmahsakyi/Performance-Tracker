const express = require('express');
const { generateCertificate, getCertificateStatus } = require('../controllers/certificateController');
const auth = require('../middleware/auth'); 

const router = express.Router();

// Get certificate status/info
router.get('/:studentId/:courseId/status', auth, getCertificateStatus);

// Download certificate (generates and serves the certificate)
router.get('/:studentId/:courseId/download', auth, generateCertificate);

module.exports = router;