const express = require('express');
const { 
  getVersions,
  deleteVersion, 
  deleteYear 
} = require('../controllers/versionController');

const router = express.Router();

router.get('/', getVersions);
router.delete('/:brand/:year/:versionName', deleteVersion);
router.delete('/year/:brand/:year', deleteYear);

module.exports = router;

