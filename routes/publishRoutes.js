const express = require('express');
const { publishVersion, getPublishedVersion } = require('../controllers/publishController');

const router = express.Router();

router.post('/', publishVersion);
router.get('/:brand', getPublishedVersion);

module.exports = router;

