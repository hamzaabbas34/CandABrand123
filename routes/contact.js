const express = require('express');
const router = express.Router();
const { contactMe , newSubscriber } = require('../controllers/contactController.js')
router.post('/contact' ,  contactMe )
router.post('/subscriber' ,  newSubscriber )
module.exports = router;