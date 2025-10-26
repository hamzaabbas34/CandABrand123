const express = require('express');
const { login, verifyToken, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyToken);
router.post('/logout', logout);

module.exports = router;

