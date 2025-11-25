// const HeroSection = require("../models/HeroSection");
// const path = require("path");
// const fs = require("fs");

// // Create new hero section
// const createHeroSection = async (req, res) => {
// 	try {
// 		const { brand, category } = req.body;

// 		// Check if files were uploaded
// 		if (!req.files || req.files.length === 0) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "At least one media file (image/video) is required",
// 			});
// 		}

// 		console.log("📁 Uploaded files info (VALIDATION PHASE):");
// 		req.files.forEach((file) => {
// 			console.log(" - File:", file.originalname, "MIME type:", file.mimetype);
// 		});

// 		// STEP 1: Validate file types FIRST without processing paths
// 		const fileValidations = req.files.map((file) => {
// 			let fileType = "unknown";

// 			if (file.mimetype.startsWith("image/")) {
// 				fileType = "image";
// 			} else if (file.mimetype.startsWith("video/")) {
// 				fileType = "video";
// 			} else {
// 				// Fallback: check file extension
// 				const ext = path.extname(file.originalname).toLowerCase();
// 				if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)) {
// 					fileType = "image";
// 				} else if (
// 					[".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext)
// 				) {
// 					fileType = "video";
// 				}
// 			}

// 			console.log("📄 File validation:");
// 			console.log("   Original:", file.originalname);
// 			console.log("   MIME Type:", file.mimetype);
// 			console.log("   Detected Type:", fileType);
// 			console.log("   Valid:", fileType !== "unknown");

// 			return {
// 				file: file,
// 				type: fileType,
// 				isValid: fileType !== "unknown",
// 				filename: file.originalname,
// 			};
// 		});

// 		// Filter out invalid files
// 		const validFiles = fileValidations.filter(
// 			(validation) => validation.isValid
// 		);
// 		const invalidFiles = fileValidations.filter(
// 			(validation) => !validation.isValid
// 		);

// 		if (invalidFiles.length > 0) {
// 			console.log(
// 				"❌ Invalid files found:",
// 				invalidFiles.map((f) => f.filename)
// 			);
// 			return res.status(400).json({
// 				success: false,
// 				message: "Some files are not valid images or videos",
// 				invalidFiles: invalidFiles.map((f) => f.filename),
// 			});
// 		}

// 		if (validFiles.length === 0) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "No valid image or video files were uploaded",
// 			});
// 		}

// 		// STEP 2: Check brand-category limits AFTER file validation
// 		const existingHeroSections = await HeroSection.find({ brand, category });
// 		const currentCount = existingHeroSections.length;
// 		const maxAllowed = 3; // 3 per category

// 		if (currentCount >= maxAllowed) {
// 			return res.status(400).json({
// 				success: false,
// 				message: `Cannot create more than ${maxAllowed} ${category} sections for ${brand} brand. Current count: ${currentCount}`,
// 			});
// 		}

// 		console.log(
// 			"✅ All validations passed! Files are valid and brand-category limit not exceeded."
// 		);

// 		// STEP 3: Only NOW process the files for saving (they're already in uploads folder by multer)
// 		const mediaFiles = validFiles.map((validation) => {
// 			const file = validation.file;

// 			// Convert absolute path to relative path
// 			const absolutePath = file.path;
// 			const relativePath = absolutePath.split("uploads/").pop();
// 			const finalPath = "uploads/" + relativePath;

// 			console.log("💾 Processing file for database:");
// 			console.log("   Original:", file.originalname);
// 			console.log("   Saved Path:", finalPath);

// 			return {
// 				url: finalPath,
// 				type: validation.type,
// 				filename: file.originalname,
// 			};
// 		});

// 		// STEP 4: Create and save hero section
// 		const heroSection = new HeroSection({
// 			brand,
// 			category,
// 			media: mediaFiles,
// 		});

// 		await heroSection.save();
// 		console.log("✅ Hero section saved successfully to database");

// 		res.status(201).json({
// 			success: true,
// 			message: "Hero section created successfully",
// 			data: heroSection,
// 			countInfo: {
// 				current: currentCount + 1,
// 				maxAllowed: maxAllowed,
// 				remaining: maxAllowed - (currentCount + 1),
// 			},
// 		});
// 	} catch (error) {
// 		console.error("❌ Error creating hero section:", error);

// 		// More detailed error logging
// 		if (error.name === "ValidationError") {
// 			console.error("Validation errors:", error.errors);
// 		}

// 		// If there's an error, you might want to clean up the uploaded files
// 		if (req.files && req.files.length > 0) {
// 			console.log("⚠️  Error occurred, uploaded files may need cleanup");
// 			// You can add file cleanup logic here if needed
// 		}

// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

// // Get all hero sections
// const getAllHeroSections = async (req, res) => {
// 	try {
// 		const heroSections = await HeroSection.find().sort({ createdAt: -1 });

// 		res.status(200).json({
// 			success: true,
// 			data: heroSections,
// 		});
// 	} catch (error) {
// 		console.error("Error fetching hero sections:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

// // Get hero section by ID
// const getHeroSectionById = async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const heroSection = await HeroSection.findById(id);

// 		if (!heroSection) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Hero section not found",
// 			});
// 		}

// 		res.status(200).json({
// 			success: true,
// 			data: heroSection,
// 		});
// 	} catch (error) {
// 		console.error("Error fetching hero section:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

// // Update hero section
// const updateHeroSection = async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const { brand, category } = req.body;

// 		const updateData = { brand, category };

// 		// If new files are uploaded, process them
// 		if (req.files && req.files.length > 0) {
// 			const newMediaFiles = req.files.map((file) => {
// 				const fileType = file.mimetype.startsWith("image/")
// 					? "image"
// 					: file.mimetype.startsWith("video/")
// 					? "video"
// 					: "unknown";

// 				return {
// 					url: file.path,
// 					type: fileType,
// 					filename: file.originalname,
// 				};
// 			});

// 			const validNewMediaFiles = newMediaFiles.filter(
// 				(file) => file.type !== "unknown"
// 			);

// 			if (validNewMediaFiles.length > 0) {
// 				updateData.media = validNewMediaFiles;
// 			}
// 		}

// 		const heroSection = await HeroSection.findByIdAndUpdate(id, updateData, {
// 			new: true,
// 			runValidators: true,
// 		});

// 		if (!heroSection) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Hero section not found",
// 			});
// 		}

// 		res.status(200).json({
// 			success: true,
// 			message: "Hero section updated successfully",
// 			data: heroSection,
// 		});
// 	} catch (error) {
// 		console.error("Error updating hero section:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

// // Delete hero section

// const deleteHeroSection = async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		// First find the hero section to get file information
// 		const heroSection = await HeroSection.findById(id);

// 		if (!heroSection) {
// 			return res.status(404).json({
// 				success: false,
// 				message: "Hero section not found",
// 			});
// 		}

// 		// Delete associated files from upload directory if they exist
// 		if (heroSection.backgroundImage) {
// 			await deleteFileFromUpload(heroSection.backgroundImage);
// 		}

// 		if (heroSection.backgroundVideo) {
// 			await deleteFileFromUpload(heroSection.backgroundVideo);
// 		}

// 		// Delete any other files that might be stored in the hero section
// 		if (heroSection.image) {
// 			await deleteFileFromUpload(heroSection.image);
// 		}

// 		if (heroSection.video) {
// 			await deleteFileFromUpload(heroSection.video);
// 		}

// 		// Delete the hero section from database
// 		await HeroSection.findByIdAndDelete(id);

// 		res.status(200).json({
// 			success: true,
// 			message: "Hero section and associated files deleted successfully",
// 		});
// 	} catch (error) {
// 		console.error("Error deleting hero section:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };

// // Helper function to delete files from upload directory
// // Helper function to delete files OR folders from upload directory
// const deleteFileFromUpload = async (filePath) => {
// 	try {
// 		// --- Existing logic to extract filename/basename ---
// 		let filename;
// 		if (filePath.includes("/")) {
// 			filename = filePath.split("/").pop();
// 		} else if (filePath.includes("\\")) {
// 			filename = filePath.split("\\").pop();
// 		} else {
// 			filename = filePath;
// 		}

// 		// Path to your upload directory (ensure path is imported/defined)
// 		// const path = require('path');
// 		// const uploadsDir = path.join(__dirname, "../uploads");
// 		// Replace with your actual path imports/definitions:
// 		const uploadsDir = path.join(__dirname, "../uploads");
// 		const fullPath = path.join(uploadsDir, filename);

// 		// --- NEW/MODIFIED LOGIC ---
// 		try {
// 			const stats = await fs.stat(fullPath); // Get file/folder stats

// 			if (stats.isDirectory()) {
// 				// IT'S A DIRECTORY: Use fs.rm() with recursive option
// 				await fs.rm(fullPath, { recursive: true, force: true });
// 				console.log(`Directory deleted successfully from uploads: ${filename}`);
// 			} else if (stats.isFile()) {
// 				// IT'S A FILE: Use fs.unlink()
// 				await fs.unlink(fullPath);
// 				console.log(`File deleted successfully from uploads: ${filename}`);
// 			}
// 		} catch (accessError) {
// 			// Error typically means the file/folder doesn't exist (ENOENT)
// 			console.log(
// 				`File or Directory not found in uploads directory: ${filename}`
// 			);
// 		}
// 	} catch (error) {
// 		console.error(`Error deleting item ${filePath}:`, error);
// 	}
// };

// module.exports = {
// 	createHeroSection,
// 	getAllHeroSections,
// 	getHeroSectionById,
// 	updateHeroSection,
// 	deleteHeroSection,
// };

const HeroSection = require("../models/HeroSection");
const path = require("path");
// 1. CRITICAL FIX: Use the promise-based version of fs for async/await
const fs = require("fs/promises");

// --- Helper Functions for File System Operations ---

/**
 * Attempts to delete a directory only if it is empty (non-recursive).
 * @param {string} directoryPath - The full absolute path to the directory.
 */
const deleteEmptyDirectory = async (directoryPath) => {
	try {
		// fs.rm is the modern way to remove files/directories.
		// recursive: false ensures it only deletes if the directory is empty.
		await fs.rm(directoryPath, { recursive: false, force: false });
		console.log(`✅ Empty directory deleted successfully: ${directoryPath}`);
	} catch (error) {
		// Common error codes if the directory is not empty or not found
		if (
			error.code === "ENOTEMPTY" ||
			error.code === "EBUSY" ||
			error.code === "EPERM"
		) {
			console.log(
				`ℹ️ Directory not empty or busy, skipping deletion: ${directoryPath}`
			);
		} else if (error.code !== "ENOENT") {
			console.error(`❌ Error deleting directory ${directoryPath}:`, error);
		}
	}
};

/**
 * REFACTORED: Deletes a file from the upload directory using its full relative path.
 * The path stored in the DB (e.g., 'uploads/hero-section/video/xxx.mp4') is passed in.
 * @param {string} filePath - The relative path stored in the database.
 */
const deleteFileFromUpload = async (filePath) => {
	if (!filePath) return;

	try {
		// CRITICAL FIX: Strip the leading 'uploads/' and resolve the path correctly.
		const relativeUploadPath = filePath.replace(/^uploads[/\\]/, "");

		// Path to your root upload directory (adjust as needed)
		const uploadsDir = path.join(__dirname, "../uploads");
		const fullPath = path.join(uploadsDir, relativeUploadPath);

		// Check if file exists and delete it
		await fs.unlink(fullPath);
		console.log(`✅ File deleted successfully: ${relativeUploadPath}`);
	} catch (error) {
		if (error.code === "ENOENT") {
			console.log(
				`⚠️ File not found (ENOENT), already deleted or path wrong: ${filePath}`
			);
		} else {
			console.error(`❌ Error deleting file ${filePath}:`, error);
		}
	}
};

// --- Main Controller Functions ---

// Create new hero section
const createHeroSection = async (req, res) => {
	try {
		const { brand } = req.body;

		// Check if files were uploaded
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				message: "At least one media file (image/video) is required",
			});
		}

		console.log("📁 Uploaded files info (VALIDATION PHASE):");
		req.files.forEach((file) => {
			console.log(" - File:", file.originalname, "MIME type:", file.mimetype);
		});

		// STEP 1: Validate file types FIRST without processing paths
		const fileValidations = req.files.map((file) => {
			let fileType = "unknown";

			if (file.mimetype.startsWith("image/")) {
				fileType = "image";
			} else if (file.mimetype.startsWith("video/")) {
				fileType = "video";
			} else {
				// Fallback: check file extension
				const ext = path.extname(file.originalname).toLowerCase();
				if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)) {
					fileType = "image";
				} else if (
					[".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"].includes(ext)
				) {
					fileType = "video";
				}
			}

			console.log("📄 File validation:");
			console.log("   Original:", file.originalname);
			console.log("   MIME Type:", file.mimetype);
			console.log("   Detected Type:", fileType);
			console.log("   Valid:", fileType !== "unknown");

			return {
				file: file,
				type: fileType,
				isValid: fileType !== "unknown",
				filename: file.originalname,
			};
		});

		// Filter out invalid files
		const validFiles = fileValidations.filter(
			(validation) => validation.isValid
		);
		const invalidFiles = fileValidations.filter(
			(validation) => !validation.isValid
		);

		if (invalidFiles.length > 0) {
			console.log(
				"❌ Invalid files found:",
				invalidFiles.map((f) => f.filename)
			);
			return res.status(400).json({
				success: false,
				message: "Some files are not valid images or videos",
				invalidFiles: invalidFiles.map((f) => f.filename),
			});
		}

		if (validFiles.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No valid image or video files were uploaded",
			});
		}

		// STEP 2: Check brand limits AFTER file validation
		const existingHeroSections = await HeroSection.find({ brand });
		const currentCount = existingHeroSections.length;
		const maxAllowed = 3; // 3 per brand

		if (currentCount >= maxAllowed) {
			return res.status(400).json({
				success: false,
				message: `Cannot create more than ${maxAllowed} sections for ${brand} brand. Current count: ${currentCount}`,
			});
		}

		console.log(
			"✅ All validations passed! Files are valid and brand limit not exceeded."
		);

		// STEP 3: Only NOW process the files for saving (they're already in uploads folder by multer)
		const mediaFiles = validFiles.map((validation) => {
			const file = validation.file;

			// Convert absolute path to relative path
			const absolutePath = file.path;
			const relativePath = absolutePath.split("uploads/").pop();
			const finalPath = "uploads/" + relativePath;

			console.log("💾 Processing file for database:");
			console.log("   Original:", file.originalname);
			console.log("   Saved Path:", finalPath);

			return {
				url: finalPath,
				type: validation.type,
				filename: file.originalname,
			};
		});

		// STEP 4: Create and save hero section
		const heroSection = new HeroSection({
			brand,
			media: mediaFiles,
		});

		await heroSection.save();
		console.log("✅ Hero section saved successfully to database");

		res.status(201).json({
			success: true,
			message: "Hero section created successfully",
			data: heroSection,
			countInfo: {
				current: currentCount + 1,
				maxAllowed: maxAllowed,
				remaining: maxAllowed - (currentCount + 1),
			},
		});
	} catch (error) {
		console.error("❌ Error creating hero section:", error);

		// More detailed error logging
		if (error.name === "ValidationError") {
			console.error("Validation errors:", error.errors);
		}

		// If there's an error, you might want to clean up the uploaded files
		if (req.files && req.files.length > 0) {
			console.log("⚠️  Error occurred, uploaded files may need cleanup");
			// You can add file cleanup logic here if needed
		}

		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};
// Get all hero sections
const getAllHeroSections = async (req, res) => {
	try {
		const heroSections = await HeroSection.find().sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: heroSections,
		});
	} catch (error) {
		console.error("Error fetching hero sections:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// Get hero section by ID
const getHeroSectionById = async (req, res) => {
	try {
		const { id } = req.params;

		const heroSection = await HeroSection.findById(id);

		if (!heroSection) {
			return res.status(404).json({
				success: false,
				message: "Hero section not found",
			});
		}

		res.status(200).json({
			success: true,
			data: heroSection,
		});
	} catch (error) {
		console.error("Error fetching hero section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// Update hero section
const updateHeroSection = async (req, res) => {
	try {
		const { id } = req.params;
		const { brand, category } = req.body;

		const updateData = { brand, category };

		// If new files are uploaded, process them
		if (req.files && req.files.length > 0) {
			const newMediaFiles = req.files.map((file) => {
				const fileType = file.mimetype.startsWith("image/")
					? "image"
					: file.mimetype.startsWith("video/")
					? "video"
					: "unknown";

				// Get the relative path just like in createHeroSection
				const relativePath = file.path.split("uploads/").pop();

				return {
					url: "uploads/" + relativePath, // Ensure correct format is saved
					type: fileType,
					filename: file.originalname,
				};
			});

			const validNewMediaFiles = newMediaFiles.filter(
				(file) => file.type !== "unknown"
			);

			if (validNewMediaFiles.length > 0) {
				// NOTE: This logic replaces all media. You should likely handle old file cleanup here too.
				updateData.media = validNewMediaFiles;
			}
		}

		const heroSection = await HeroSection.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!heroSection) {
			return res.status(404).json({
				success: false,
				message: "Hero section not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Hero section updated successfully",
			data: heroSection,
		});
	} catch (error) {
		console.error("Error updating hero section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// Delete hero section
const deleteHeroSection = async (req, res) => {
	try {
		const { id } = req.params;

		// 1. Find the hero section to get file information
		const heroSection = await HeroSection.findById(id);

		if (!heroSection) {
			return res.status(404).json({
				success: false,
				message: "Hero section not found",
			});
		}

		// 2. Delete associated files from upload directory if they exist
		// Note: We are using the fields from your original code (backgroundImage, etc.)
		if (heroSection.backgroundImage) {
			await deleteFileFromUpload(heroSection.backgroundImage);
		}

		if (heroSection.backgroundVideo) {
			await deleteFileFromUpload(heroSection.backgroundVideo);
		}

		if (heroSection.image) {
			await deleteFileFromUpload(heroSection.image);
		}

		if (heroSection.video) {
			await deleteFileFromUpload(heroSection.video);
		}

		// 3. 🆕 NEW LOGIC: Clean up the parent folders dynamically.
		const uploadsRoot = path.join(__dirname, "../uploads");
		const parentDirectories = new Set();

		// Collect file paths from all potential fields
		const filePaths = [
			heroSection.backgroundImage,
			heroSection.backgroundVideo,
			heroSection.image,
			heroSection.video,
		].filter(Boolean);

		filePaths.forEach((filePath) => {
			// Get the path relative to the uploads root: 'hero-section/video/xxx.mp4'
			const relativePath = filePath.replace(/^uploads[/\\]/, "");

			// Get the containing directory path: 'hero-section/video'
			const parentDirRelative = path.dirname(relativePath);

			// Get the absolute path for cleanup: <project_root>/uploads/hero-section/video
			const parentDirAbsolute = path.join(uploadsRoot, parentDirRelative);

			parentDirectories.add(parentDirAbsolute);
		});

		// Attempt to delete sub-directories (like 'video' and 'image')
		for (const dirPath of parentDirectories) {
			await deleteEmptyDirectory(dirPath);
		}

		// 4. Try to clean up the main 'hero-section' folder if it became empty
		const heroSectionFolder = path.join(uploadsRoot, "hero-section");
		await deleteEmptyDirectory(heroSectionFolder);

		// 5. Delete the hero section from database
		await HeroSection.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Hero section and associated files deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting hero section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

module.exports = {
	createHeroSection,
	getAllHeroSections,
	getHeroSectionById,
	updateHeroSection,
	deleteHeroSection,
};
