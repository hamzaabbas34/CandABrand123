const multer = require('multer');
const { errorResponse } = require('../utils/responseUtils');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File size too large. Maximum 100MB per file. Please compress your images or contact support for bulk uploads.');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 400, 'Too many files uploaded. Maximum 1000 images per upload.');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 400, 'Unexpected file field. Please ensure you are uploading Excel file as "excel" and images as "images".');
    }
    return errorResponse(res, 400, `Upload error: ${err.message}`);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, 400, 'Validation error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return errorResponse(res, 409, 'Duplicate entry', err.keyValue);
  }

  // Default error
  return errorResponse(res, 500, err.message || 'Internal server error');
};

module.exports = errorHandler;

