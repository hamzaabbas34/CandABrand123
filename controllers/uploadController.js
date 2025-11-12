const Product = require("../models/Product");
const Release = require("../models/Release");
const {
	parseExcel,
	validateExcelStructure,
	transformExcelToProducts,
} = require("../utils/excelUtils");
const {
	matchImagesToStyles,
	saveImagesToDisk,
	deleteVersionDirectory,
} = require("../utils/fileUtils");
const { validateProducts } = require("../utils/validationUtils");
const { successResponse, errorResponse } = require("../utils/responseUtils");

/**
 * Validate Excel and images before upload
 */
const validateUpload = async (req, res) => {
	try {
		const { brand, year, versionName } = req.body;
		console.log(req.body);

		// Check if files are provided
		if (!req.files || !req.files.excel || !req.files.images) {
			return errorResponse(res, 400, "Excel file and images are required");
		}

		const excelFile = req.files.excel[0];
		const imageFiles = req.files.images;

		// Parse Excel
		const excelData = parseExcel(excelFile.buffer);

		// Validate Excel structure
		const validation = validateExcelStructure(excelData, brand);
		if (!validation.isValid) {
			return errorResponse(
				res,
				400,
				"Excel validation failed",
				validation.errors
			);
		}

		// Transform to products
		const products = transformExcelToProducts(
			excelData,
			brand,
			year,
			versionName
		);

		// Validate products
		const productValidation = validateProducts(products);
		if (!productValidation.isValid) {
			return errorResponse(
				res,
				400,
				"Product validation failed",
				productValidation.errors
			);
		}

		// Match images to styles
		const styles = products.map((p) => p.style);
		const imageMatching = matchImagesToStyles(imageFiles, styles);

		// Build product preview with image status
		const productPreview = products.map((product) => ({
			style: product.style,
			division: product.division,
			price: product.price,
			colors: product.colors,
			size: product.size,
			hasImages: imageMatching.styleImageMap[product.style]?.length > 0,
			imageCount: imageMatching.styleImageMap[product.style]?.length || 0,
		}));

		// Check if version already exists
		

		return successResponse(
			res,
			{
			
				validRows: validation.validRows,
				totalRows: validation.totalRows,
				invalidRows: validation.invalidRows || [],
				missingImages: imageMatching.missingStyles,
				orphanImages: imageMatching.orphanImages,
				warnings: validation.warnings,
				errors: validation.errors,
				productPreview: productPreview.slice(0, 100), // First 100 for preview
			},
			"Validation successful"
		);
	} catch (error) {
		console.error("Validation error:", error);
		return errorResponse(res, 500, "Validation failed", error.message);
	}
};

const bulkUpload = async (req, res) => {
	console.log("Bulk upload initiated");
	try {
		const { brand, year, versionName, overwrite, category } = req.body;

		console.log("heeloo0", brand, year, versionName, overwrite);
		// Check if files are provided
		if (!req.files || !req.files.excel || !req.files.images) {
			return errorResponse(res, 400, "Excel file and images are required");
		}

		const excelFile = req.files.excel[0];
		const imageFiles = req.files.images;

		// Parse Excel
		const excelData = parseExcel(excelFile.buffer);

		// Validate Excel structure
		const validation = validateExcelStructure(excelData, brand);
		if (!validation.isValid) {
			return errorResponse(
				res,
				400,
				"Excel validation failed",
				validation.errors
			);
		}

		// Transform to products
		const products = transformExcelToProducts(
			excelData,
			brand,
			year,
			versionName,
			category
		);

		// Validate products
		const productValidation = validateProducts(products);
		if (!productValidation.isValid) {
			return errorResponse(
				res,
				400,
				"Product validation failed",
				productValidation.errors
			);
		}

		// Match images to styles
		const styles = products.map((p) => p.style);
		const imageMatching = matchImagesToStyles(imageFiles, styles);

		// Log missing styles but don't block upload
		if (imageMatching.missingStyles.length > 0) {
			console.log(
				`⚠️ Products missing images: ${imageMatching.missingStyles.join(", ")}`
			);
			console.log(`ℹ️ These products will be skipped from upload`);
		}

		// Check if version exists
		const existingRelease = await Release.findOne({
			brand,
			year,
			versionName,
			category,
		});

		if (existingRelease && overwrite !== "true") {
			return errorResponse(
				res,
				409,
				"Version already exists. Please confirm overwrite.",
				{ requiresConfirmation: true }
			);
		}

		// If overwriting, delete old data
		if (existingRelease && overwrite === "true") {
			await Product.deleteMany({ brand, year, versionName });
			deleteVersionDirectory(brand, year, versionName);
		}

		// Save images and update product records (only for products with images)
		const productsToInsert = [];
		const skippedProducts = [];

		for (const product of products) {
			const styleImages = imageMatching.styleImageMap[product.style];

			if (styleImages && styleImages.length > 0) {
				// Save images to disk
				const imagePaths = saveImagesToDisk(
					styleImages,
					brand,
					year,
					versionName,
					product.division,
					product.style
				);

				product.images = imagePaths;
				productsToInsert.push(product);
			} else {
				// Skip products without images
				skippedProducts.push({
					style: product.style,
					reason: "No images found",
				});
				console.log(`⏭️ Skipping product ${product.style} - no images found`);
			}
		}

		// Check if we have any products to insert
		if (productsToInsert.length === 0) {
			return errorResponse(
				res,
				400,
				"No products to upload - all products are missing images",
				{
					skippedProducts: skippedProducts,
				
				}
			);
		}

		// Batch insert products (in chunks of 500)
		const chunkSize = 500;
		for (let i = 0; i < productsToInsert.length; i += chunkSize) {
			const chunk = productsToInsert.slice(i, i + chunkSize);
			await Product.insertMany(chunk);
		}

		// Create or update release
		if (existingRelease) {
			existingRelease.updatedAt = new Date();
			await existingRelease.save();
		} else {
			await Release.create({
				brand,
				year,
				versionName,
				category,
				isPublished: false,
			
			});
		}

		return successResponse(
			res,
			{
				productsUploaded: productsToInsert.length,
				productsSkipped: skippedProducts.length,
				imagesUploaded: imageFiles.length,
				skippedProducts: skippedProducts,
			
				orphanImages: imageMatching.orphanImages,
			},
			`Upload successful! ${productsToInsert.length} products uploaded, ${skippedProducts.length} products skipped (missing images)`,
			201
		);
	} catch (error) {
		console.error("Upload error:", error);
		return errorResponse(res, 500, "Upload failed", error.message);
	}
};

module.exports = {
	validateUpload,
	bulkUpload,
};
