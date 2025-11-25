const express = require("express");
const router = express.Router();
const {
	createHeroSection,
	getAllHeroSections,
	getHeroSectionById,
	updateHeroSection,
	deleteHeroSection,
} = require("../controllers/heroSectionController");

const HeroSection = require("../models/HeroSection");
// Middleware for file uploads (using multer)
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = path.join(__dirname, "../../uploads/hero-section/");

		// Create directory if it doesn't exist
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
			console.log("✅ Created directory:", uploadDir);
		}

		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
		);
	},
});
// File filter for images and videos
const fileFilter = (req, file, cb) => {
	console.log("📋 Checking file type:", file.mimetype, file.originalname);

	if (
		file.mimetype.startsWith("image/") ||
		file.mimetype.startsWith("video/")
	) {
		cb(null, true);
	} else {
		console.log("❌ Invalid file type:", file.mimetype);
		cb(new Error("Only image and video files are allowed!"), false);
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit for videos
	},
});

// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
	if (error) {
		if (error instanceof multer.MulterError) {
			if (error.code === "LIMIT_FILE_SIZE") {
				return res.status(400).json({
					success: false,
					message: "File too large. Maximum size is 50MB.",
				});
			}
			if (error.code === "LIMIT_FILE_COUNT") {
				return res.status(400).json({
					success: false,
					message: "Too many files. Maximum 10 files allowed.",
				});
			}
		}
		return res.status(400).json({
			success: false,
			message: error.message,
		});
	}
	next();
};

router.post("/brand", async (req, res) => {
	try {
		const { brand } = req.body;

		console.log("Fetching hero sections for brand:", brand);

		// 1. Use await directly inside the async function
		const heroSections = await HeroSection.find({ brand });

		// 2. Send success response
		res.json({ success: true, data: heroSections });
	} catch (error) {
		// 3. Catch and handle any errors during the database query
		console.error("Error fetching hero sections:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error fetching hero sections",
			error: error.message,
		});
	}
});
// Routes with error handling
router.post(
	"/",
	upload.array("media", 10),
	handleMulterError,
	createHeroSection
);

router.get("/", getAllHeroSections);

router.get("/:id", getHeroSectionById);
router.put(
	"/:id",
	upload.array("media", 10),
	handleMulterError,
	updateHeroSection
);
router.delete("/:id", deleteHeroSection);

module.exports = router;
