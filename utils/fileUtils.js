

const fs = require("fs");
const path = require("path");

/**
 * Match images to product styles
 * Supports variations: STYLE, STYLE (1), STYLE_1, STYLE-1
 * @param {Array} imageFiles - Array of uploaded image files
 * @param {Array} styles - Array of product style identifiers
 * @returns {Object} - Matching result with assignments, missing, and orphans
 */
// const matchImagesToStyles = (imageFiles, styles) => {
// 	const styleImageMap = {};
// 	const orphanImages = [];
// 	const missingStyles = new Set(styles);

// 	// Initialize map for each style
// 	styles.forEach((style) => {
// 		styleImageMap[style] = [];
// 	});

// 	// Match images to styles
// 	imageFiles.forEach((file) => {
// 		const filename = file.originalname;
// 		const nameWithoutExt = path.parse(filename).name;
// 		console.log(filename);

// 		let matched = false;

// 		for (const style of styles) {
// 			// Create regex patterns for matching
// 			// Exact match: STYLE
// 			// With parentheses: STYLE (1), STYLE (2)
// 			// With underscore: STYLE_1, STYLE_2
// 			// With dash: STYLE-1, STYLE-2
// 			const patterns = [
// 				new RegExp(`^${escapeRegex(style)}$`, "i"),
// 				new RegExp(`^${escapeRegex(style)}\\s*\\(\\d+\\)$`, "i"),
// 				new RegExp(`^${escapeRegex(style)}[_-]\\d+$`, "i"),
// 			];

// 			if (patterns.some((pattern) => pattern.test(nameWithoutExt))) {
// 				styleImageMap[style].push(file);
// 				missingStyles.delete(style);
// 				matched = true;
// 				break;
// 			}
// 		}

// 		if (!matched) {
// 			orphanImages.push(filename);
// 		}
// 	});

// 	return {
// 		styleImageMap,
// 		missingStyles: Array.from(missingStyles),
// 		orphanImages,
// 	};
// };

const matchImagesToStyles = (imageFiles, styles) => {
	const styleImageMap = {};
	const orphanImages = [];
	const missingStyles = new Set(styles);

	// Initialize map for each style
	styles.forEach((style) => {
		styleImageMap[style] = [];
	});

	// Create a map of first parts to full styles for quick lookup
	const firstPartToStyleMap = {};
	styles.forEach((style) => {
		const firstPart = style.split(/[-_\s]/)[0]; // Split by dash, underscore, or space and take first part
		firstPartToStyleMap[firstPart] = style;
		console.log(`Style mapping: ${firstPart} -> ${style}`);
	});

	// Match images to styles using first part matching
	imageFiles.forEach((file) => {
		const filename = file.originalname;
		const nameWithoutExt = path.parse(filename).name;
		console.log("Processing image:", filename);

		let matched = false;

		// Extract first part from image name (split by dash, underscore, space, or parentheses)
		const imageFirstPart = nameWithoutExt.split(/[-_\s(]/)[0]; // Split and take first part
		console.log(`Image first part: ${imageFirstPart}`);

		// Find matching style using first part
		if (firstPartToStyleMap[imageFirstPart]) {
			const matchedStyle = firstPartToStyleMap[imageFirstPart];
			console.log(`✅ First part match: ${imageFirstPart} -> ${matchedStyle}`);
			styleImageMap[matchedStyle].push(file);
			missingStyles.delete(matchedStyle);
			matched = true;
		}

		if (!matched) {
			console.log(
				`❌ No match found for: ${filename} (first part: ${imageFirstPart})`
			);
			orphanImages.push(filename);
		}
	});

	console.log("Final matching results:", {
		matchedStyles: Object.keys(styleImageMap).filter(
			(style) => styleImageMap[style].length > 0
		),
		missingStyles: Array.from(missingStyles),
		orphanImages,
	});

	return {
		styleImageMap,
		missingStyles: Array.from(missingStyles),
		orphanImages,
	};
};
/**
 * Escape special regex characters
 */


/**
 * Save images to disk with structured directory
 * @param {Array} images - Array of image files for a style
 * @param {String} brand - Brand name
 * @param {Number} year - Year
 * @param {String} versionName - Version name
 * @param {String} division - Division/category
 * @param {String} style - Style identifier
 * @returns {Array} - Array of saved image paths
 */
const saveImagesToDisk = (
	images,
	brand,
	year,
	versionName,
	division,
	style
) => {
	// Create directory structure: uploads/{brand}/{year}/{version}/{division}/{style}/
	const uploadDir = path.join(
		__dirname,
		"..",
		"..",
		"uploads",
		brand,
		String(year),
		versionName,
		division,
		style
	);

	// Create directory if it doesn't exist
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	const savedPaths = [];

	images.forEach((image, index) => {
		const ext = path.extname(image.originalname);
		const filename = index === 0 ? `${style}${ext}` : `${style}_${index}${ext}`;
		const filePath = path.join(uploadDir, filename);

		try {
			// Write file
			fs.writeFileSync(filePath, image.buffer);

			// Store relative path for database
			const relativePath = path.join(
				"uploads",
				brand,
				String(year),
				versionName,
				division,
				style,
				filename
			);

			savedPaths.push(relativePath);
		} catch (error) {
			console.error(`Error saving image ${filename}:`, error);
			throw new Error(`Failed to save image ${filename}: ${error.message}`);
		}
	});

	return savedPaths;
};

/**
 * Delete directory and all contents
 * @param {String} dirPath - Directory path to delete
 */
const deleteDirectory = (dirPath) => {
	if (fs.existsSync(dirPath)) {
		try {
			fs.rmSync(dirPath, { recursive: true, force: true });
			return true;
		} catch (error) {
			console.error(`Error deleting directory ${dirPath}:`, error);
			return false;
		}
	}
	return true;
};

/**
 * Delete specific version directory
 * @param {String} brand - Brand name
 * @param {Number} year - Year
 * @param {String} versionName - Version name
 */
const deleteVersionDirectory = (brand, year, versionName) => {
	const versionPath = path.join(
		__dirname,
		"..",
		"..",
		"uploads",
		brand,
		String(year),
		versionName
	);
	return deleteDirectory(versionPath);
};

/**
 * Delete entire year directory
 * @param {String} brand - Brand name
 * @param {Number} year - Year
 */
const deleteYearDirectory = (brand, year) => {
	const yearPath = path.join(
		__dirname,
		"..",
		"..",
		"uploads",
		brand,
		String(year)
	);
	return deleteDirectory(yearPath);
};

/**
 * Get all styles from products array
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of style strings
 */
const extractStylesFromProducts = (products) => {
	return products
		.map((product) => product.style)
		.filter((style) => style && style.trim() !== "");
};

/**
 * Validate image files
 * @param {Array} imageFiles - Array of image files
 * @returns {Object} - Validation result
 */
const validateImageFiles = (imageFiles) => {
	const errors = [];
	const validImages = [];

	if (!imageFiles || imageFiles.length === 0) {
		errors.push("No image files provided");
		return { isValid: false, errors, validImages };
	}

	imageFiles.forEach((file) => {
		// Check if file is an image
		const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
		const ext = path.extname(file.originalname).toLowerCase();

		if (!allowedExtensions.includes(ext)) {
			errors.push(`File ${file.originalname} is not a supported image format`);
			return;
		}

		// Check file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			errors.push(`File ${file.originalname} is too large (max 10MB)`);
			return;
		}

		validImages.push(file);
	});

	return {
		isValid: errors.length === 0,
		errors,
		validImages,
	};
};
// Add this function to your fileUtils.js
const deleteImageFromDisk = (imagePath) => {
    try {
        // Construct full path to the image
        const fullPath = path.join(__dirname, '..', imagePath);
        
        // Check if file exists
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Successfully deleted image: ${fullPath}`);
            return true;
        } else {
            console.log(`Image not found: ${fullPath}`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting image ${imagePath}:`, error);
        throw error;
    }
};

module.exports = {
	matchImagesToStyles,
	saveImagesToDisk,
	deleteDirectory,
	deleteImageFromDisk,
	deleteVersionDirectory,
	deleteYearDirectory,
	extractStylesFromProducts,
	validateImageFiles,
};
