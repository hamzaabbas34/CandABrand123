const multer = require('multer');

// Use memory storage for processing
const storage = multer.memoryStorage();

// File filter for images and Excel
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'excel') {
    // Accept Excel files
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed for excel field'), false);
    }
  } else if (file.fieldname === 'images') {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for images field'), false);
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB per file (for high-resolution product images)
  }
});

module.exports = upload;

