const express = require('express');
const { validateUpload, bulkUpload } = require('../controllers/uploadController');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload routes with multer middleware
router.post('/validate', 
  upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'images', maxCount: 1000 }
  ]),
  validateUpload
);

router.post('/bulk',
  upload.fields([
    { name: 'excel', maxCount: 1 },
    { name: 'images', maxCount: 1000 }
  ]),
  bulkUpload
);

module.exports = router;

