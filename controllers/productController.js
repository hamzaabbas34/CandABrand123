const Product = require("../models/Product");
const Release = require("../models/Release");
const { successResponse, errorResponse } = require("../utils/responseUtils");
const { saveImagesToDisk, deleteImageFromDisk } = require("../utils/fileUtils");

/**
 * Get all products with filters and pagination
 */
const getProducts = async (req, res) => {
	try {
		const {
			brand,
			year,
			versionName,
			category,
			style,
			page = 1,
			limit = 20,
		} = req.query;
		console.log(req.query);

		// Build filter
		const filter = {};
		if (brand) filter.brand = brand;
		if (year) filter.year = Number(year);
		if (versionName) filter.versionName = versionName;
		if (category) filter.category = category;
		if (style) filter.style = { $regex: style, $options: "i" };

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Execute query
		const [products, total] = await Promise.all([
			Product.find(filter)
				.skip(skip)
				.limit(Number(limit))
				.sort({ createdAt: -1 })
				.lean(),
			Product.countDocuments(filter),
		]);

		return successResponse(res, {
			products,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				totalPages: Math.ceil(total / Number(limit)),
				hasNextPage: skip + products.length < total,
				hasPrevPage: Number(page) > 1,
			},
		});
	} catch (error) {
		console.error("Get products error:", error);
		return errorResponse(res, 500, "Failed to fetch products", error.message);
	}
};

const getProductByBrand = async (req, res) => {
	try {
		const { brand } = req.body;
		console.log(" brand", brand);
		if (!brand) {
			return errorResponse(res, 400, "Brand is required");
		}
		const isPublish = await Release.findOne({ brand, isPublished: true });
		const products = await Product.find({
			brand: brand,
			year: isPublish.year,
			versionName: isPublish.versionName,
			category: isPublish.category,
		});
		console.error("Get products", products);
		console.log(isPublish);
		return successResponse(res, products);
	} catch (error) {
		console.error("Get products error:", error);
		return errorResponse(res, 500, "Failed to fetch products", error.message);
	}
};

const getProductById = async (req, res) => {
	try {
		const { id } = req.params;

		const product = await Product.findById(id);

		if (!product) {
			return errorResponse(res, 404, "Product not found");
		}

		return successResponse(res, product);
	} catch (error) {
		console.error("Get product error:", error);
		return errorResponse(res, 500, "Failed to fetch product", error.message);
	}
};

const updateProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const { price, size, colors, imagesToDelete } = req.body;

		const product = await Product.findById(id);

		if (!product) {
			return errorResponse(res, 404, "Product not found");
		}

		// Update fields
		if (price !== undefined) product.price = Number(price);
		if (size !== undefined) product.size = size;
		if (colors !== undefined) {
			try {
				// Parse colors if it's a string
				product.colors =
					typeof colors === "string" ? JSON.parse(colors) : colors;
			} catch (error) {
				console.error("Error parsing colors:", error);
				product.colors = colors;
			}
		}

		// Handle image deletion if provided
		let parsedImagesToDelete = [];
		if (imagesToDelete) {
			try {
				// Parse imagesToDelete if it's a string
				parsedImagesToDelete =
					typeof imagesToDelete === "string"
						? JSON.parse(imagesToDelete)
						: imagesToDelete;
			} catch (error) {
				console.error("Error parsing imagesToDelete:", error);
				parsedImagesToDelete = [];
			}
		}

		if (
			Array.isArray(parsedImagesToDelete) &&
			parsedImagesToDelete.length > 0
		) {
			console.log("Deleting images:", parsedImagesToDelete);

			// Delete images from disk
			parsedImagesToDelete.forEach((imagePath) => {
				try {
					deleteImageFromDisk(imagePath);
					console.log(`Successfully deleted image: ${imagePath}`);
				} catch (deleteError) {
					console.error(`Failed to delete image: ${imagePath}`, deleteError);
				}
			});

			// Remove deleted images from product images array
			product.images = product.images.filter(
				(image) => !parsedImagesToDelete.includes(image)
			);
			console.log("Remaining images after deletion:", product.images);
		}

		// Handle new images if provided
		if (req.files && req.files.images) {
			const imageFiles = req.files.images;

			// Provide default values for any undefined fields to prevent path errors
			const brand = product.brand || "unknown";
			const year = product.year || "unknown";
			const versionName = product.versionName || "unknown";
			const division = product.division || "unknown";
			const style = product.style || "unknown";

			const imagePaths = saveImagesToDisk(
				imageFiles,
				brand,
				year,
				versionName,
				division,
				style
			);
			product.images = [...product.images, ...imagePaths];
		}

		await product.save();
		console.log("Product saved successfully");

		return successResponse(res, product, "Product updated successfully");
	} catch (error) {
		console.error("Update product error:", error);
		return errorResponse(res, 500, "Failed to update product", error.message);
	}
};

const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;

		const product = await Product.findByIdAndDelete(id);

		if (!product) {
			return errorResponse(res, 404, "Product not found");
		}

		return successResponse(res, null, "Product deleted successfully");
	} catch (error) {
		console.error("Delete product error:", error);
		return errorResponse(res, 500, "Failed to delete product", error.message);
	}
};

module.exports = {
	getProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	getProductByBrand,
};
