const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const config = require('../config/default.json');
const createError = require('http-errors');

const s3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

// Memory storage
const storage = multer.memoryStorage();

const s3FileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(createError(400, 'Only images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: s3FileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([{ name: 'photo', maxCount: 1 }]);

const uploadToS3 = async (file, role = 'common') => {
  const folder = role.toLowerCase();
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,          // <-- direct from memory
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${config.AWS_BUCKET_NAME}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = {
  upload,
  uploadToS3,
};
