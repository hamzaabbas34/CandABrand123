const express = require("express");
const router = express.Router();
const {
	contactMe,
	newSubscriber,
} = require("../controllers/contactController.js");
const { navbar } = require("../controllers/productController.js");
router.post("/contact", contactMe);
router.post("/subscriber", newSubscriber);
router.post("/navbar", navbar);
module.exports = router;
