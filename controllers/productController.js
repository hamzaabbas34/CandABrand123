// const Product = require("../models/Product");
// const Release = require("../models/Release");
// const SizeChart = require("../models/SizeChart");
// const { successResponse, errorResponse } = require("../utils/responseUtils");
// const { saveImagesToDisk, deleteImageFromDisk } = require("../utils/fileUtils");

// const getProducts = async (req, res) => {
// 	try {
// 		const {
// 			brand,
// 			year,
// 			versionName,
// 			category,
// 			style,
// 			page = 1,
// 			limit = 10,
// 		} = req.query;
// 		console.log("request quary", req.query);

// 		// Build filter
// 		const filter = {};
// 		if (brand) filter.brand = brand;
// 		if (year) filter.year = Number(year);
// 		if (versionName) filter.versionName = versionName;
// 		if (category) filter.category = category;
// 		if (style) filter.style = { $regex: style, $options: "i" };

// 		// Calculate pagination
// 		const skip = (Number(page) - 1) * Number(limit);

// 		// Execute query - Sort by style alphanumerically
// 		const [products, total] = await Promise.all([
// 			Product.find(filter)
// 				.skip(skip)
// 				.limit(Number(limit))
// 				.sort({ style: 1 }) // Sort by style ascending
// 				.lean(),
// 			Product.countDocuments(filter),
// 		]);

// 		return successResponse(res, {
// 			products,
// 			pagination: {
// 				page: Number(page),
// 				limit: Number(limit),
// 				total,
// 				totalPages: Math.ceil(total / Number(limit)),
// 				hasNextPage: skip + products.length < total,
// 				hasPrevPage: Number(page) > 1,
// 			},
// 		});
// 	} catch (error) {
// 		console.error("Get products error:", error);
// 		return errorResponse(res, 500, "Failed to fetch products", error.message);
// 	}
// };

// const getProductByBrand = async (req, res) => {
// 	try {
// 		const { brand } = req.body;
// 		console.log("Brand:", brand);

// 		if (!brand) {
// 			return errorResponse(res, 400, "Brand is required");
// 		}

// 		// Find the published release for the brand
// 		const publishedReleases = await Release.find({ brand, isPublished: true });

// 		if (!publishedReleases || publishedReleases.length === 0) {
// 			return res.status(200).json({
// 				success: false,
// 				message: "No published release found",
// 				data: {
// 					products: [],
// 					categories: [],
// 					years: [],
// 				},
// 			});
// 		}

// 		console.log("Published releases found:", publishedReleases.length);

// 		// Extract all years, versionNames, and categories from published releases
// 		const years = publishedReleases.map((release) => release.year);
// 		const versionNames = publishedReleases.map(
// 			(release) => release.versionName
// 		);
// 		const categories = publishedReleases.map((release) => release.category);

// 		// Fetch products for ALL published releases
// 		const products = await Product.find({
// 			brand,
// 			year: { $in: years },
// 			versionName: { $in: versionNames },
// 			category: { $in: categories },
// 		});

// 		if (!products || products.length === 0) {
// 			return res.status(200).json({
// 				success: false,
// 				message: "No products available",
// 				data: {
// 					products: [],
// 					categories: [],
// 					years: [],
// 				},
// 			});
// 		}

// 		// 🧠 Fetch all unique categories and years from the actual products
// 		const uniqueCategories = await Product.distinct("category", {
// 			brand,
// 			year: { $in: years },
// 			versionName: { $in: versionNames },
// 		});

// 		const uniqueYears = await Product.distinct("year", {
// 			brand,
// 			year: { $in: years },
// 			versionName: { $in: versionNames },
// 		});

// 		console.log("Fetched products:", products.length);
// 		console.log("Categories:", uniqueCategories);
// 		console.log("Years:", uniqueYears);

// 		return res.status(200).json({
// 			success: true,
// 			message: "Products fetched successfully",
// 			data: {
// 				products,
// 				categories: uniqueCategories,
// 				years: uniqueYears,
// 			},
// 		});
// 	} catch (error) {
// 		console.error("Get products error:", error);
// 		return errorResponse(res, 500, "Failed to fetch products", error.message);
// 	}
// };

// const getProductById = async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const product = await Product.findById(id);

// 		if (!product) {
// 			return errorResponse(res, 404, "Product not found");
// 		}

// 		return successResponse(res, product);
// 	} catch (error) {
// 		console.error("Get product error:", error);
// 		return errorResponse(res, 500, "Failed to fetch product", error.message);
// 	}
// };
// const updateProduct = async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const { price, size, colors, availability, imagesToDelete } = req.body;
// 		console.log("reqbody ", req.body);
// 		const product = await Product.findById(id);

// 		if (!product) {
// 			return errorResponse(res, 404, "Product not found");
// 		}

// 		// Update fields
// 		if (price !== undefined) product.price = Number(price);
// 		if (size !== undefined) product.size = size;
// 		if (availability !== undefined) product.availability = availability;
// 		if (colors !== undefined) {
// 			try {
// 				// Parse colors if it's a string
// 				product.colors =
// 					typeof colors === "string" ? JSON.parse(colors) : colors;
// 			} catch (error) {
// 				console.error("Error parsing colors:", error);
// 				product.colors = colors;
// 			}
// 		}

// 		// Handle image deletion if provided
// 		let parsedImagesToDelete = [];
// 		if (imagesToDelete) {
// 			try {
// 				// Parse imagesToDelete if it's a string
// 				parsedImagesToDelete =
// 					typeof imagesToDelete === "string"
// 						? JSON.parse(imagesToDelete)
// 						: imagesToDelete;
// 			} catch (error) {
// 				console.error("Error parsing imagesToDelete:", error);
// 				parsedImagesToDelete = [];
// 			}
// 		}

// 		if (
// 			Array.isArray(parsedImagesToDelete) &&
// 			parsedImagesToDelete.length > 0
// 		) {
// 			console.log("Deleting images:", parsedImagesToDelete);

// 			// Delete images from disk
// 			parsedImagesToDelete.forEach((imagePath) => {
// 				try {
// 					deleteImageFromDisk(imagePath);
// 					console.log(`Successfully deleted image: ${imagePath}`);
// 				} catch (deleteError) {
// 					console.error(`Failed to delete image: ${imagePath}`, deleteError);
// 				}
// 			});

// 			// Remove deleted images from product images array
// 			product.images = product.images.filter(
// 				(image) => !parsedImagesToDelete.includes(image)
// 			);
// 			console.log("Remaining images after deletion:", product.images);
// 		}

// 		// Handle new images if provided
// 		if (req.files && req.files.images) {
// 			const imageFiles = req.files.images;

// 			// Provide default values for any undefined fields to prevent path errors
// 			const brand = product.brand || "unknown";
// 			const year = product.year || "unknown";
// 			const versionName = product.versionName || "unknown";
// 			const division = product.division || "unknown";
// 			const style = product.style || "unknown";

// 			const imagePaths = saveImagesToDisk(
// 				imageFiles,
// 				brand,
// 				year,
// 				versionName,
// 				division,
// 				style
// 			);
// 			product.images = [...product.images, ...imagePaths];
// 		}

// 		await product.save();
// 		console.log("Product saved successfully");

// 		return successResponse(res, product, "Product updated successfully");
// 	} catch (error) {
// 		console.error("Update product error:", error);
// 		return errorResponse(res, 500, "Failed to update product", error.message);
// 	}
// };
// const deleteProduct = async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const product = await Product.findByIdAndDelete(id);

// 		if (!product) {
// 			return errorResponse(res, 404, "Product not found");
// 		}

// 		return successResponse(res, null, "Product deleted successfully");
// 	} catch (error) {
// 		console.error("Delete product error:", error);
// 		return errorResponse(res, 500, "Failed to delete product", error.message);
// 	}
// };

// const footerApi = async (req, res) => {
// 	try {
// 		const { brand } = req.body;

// 		if (!brand) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Brand name is required",
// 			});
// 		}

// 		// Find published releases for that brand
// 		const publishedReleases = await Release.find({
// 			brand,
// 			isPublished: true,
// 		});

// 		if (!publishedReleases || publishedReleases.length === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				message: `No published releases found for brand: ${brand}`,
// 			});
// 		}

// 		// Group years by category
// 		const categoryYears = {};

// 		publishedReleases.forEach((release) => {
// 			if (!categoryYears[release.category]) {
// 				categoryYears[release.category] = [];
// 			}
// 			if (!categoryYears[release.category].includes(release.year)) {
// 				categoryYears[release.category].push(release.year);
// 			}
// 		});

// 		// Sort years descending for each category
// 		Object.keys(categoryYears).forEach((cat) => {
// 			categoryYears[cat].sort((a, b) => b - a);
// 		});

// 		res.status(200).json({
// 			success: true,
// 			brand,
// 			data: categoryYears,
// 		});
// 	} catch (error) {
// 		console.error("Footer API Error:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };
// const getSimplifiedCategoryKey = (category) => {
// 	if (!category || typeof category !== "string") return "Other";
// 	const lowerCat = category.toLowerCase();

// 	// Standardize 'Prom' categories
// 	if (lowerCat.includes("prom")) {
// 		return "Prom";
// 	}
// 	// Standardize 'Bridal' categories
// 	if (lowerCat.includes("bridal") || lowerCat.includes("wedding")) {
// 		return "Bridal";
// 	}
// 	// Standardize 'Evening' categories
// 	if (lowerCat.includes("evening") || lowerCat.includes("cocktail")) {
// 		return "Evening";
// 	}
// 	// Use the original category as a fallback if no keywords match
// 	return category;
// };

// const navbar = async (req, res) => {
// 	try {
// 		const { brand } = req.body;

// 		if (!brand) {
// 			return res.status(400).json({
// 				success: false,
// 				message: "Brand name is required",
// 			});
// 		}

// 		// Fetch all published releases for the brand
// 		const publishedReleases = await Release.find({
// 			brand,
// 			isPublished: true,
// 		});

// 		if (!publishedReleases || publishedReleases.length === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				message: `No published releases found for brand: ${brand}`,
// 			});
// 		}

// 		// Structure: { simpleCategory: { years: [...], sizeChartImage: 'path/to/img' } }
// 		const categoriesData = {};
// 		const categoriesToFetch = new Set();

// 		publishedReleases.forEach((release) => {
// 			const simpleCategory = getSimplifiedCategoryKey(release.category);
// 			categoriesToFetch.add(simpleCategory);

// 			if (!categoriesData[simpleCategory]) {
// 				categoriesData[simpleCategory] = {
// 					years: [],
// 					sizeChartImage: null,
// 				};
// 			}
// 			// Add the year if it doesn't already exist
// 			if (!categoriesData[simpleCategory].years.includes(release.year)) {
// 				categoriesData[simpleCategory].years.push(release.year);
// 			}
// 		});

// 		// Fetch Size Chart Images
// 		const uniqueCategories = Array.from(categoriesToFetch);
// 		const sizeCharts = await SizeChart.find({
// 			brand: brand,
// 			category: { $in: uniqueCategories },
// 		});

// 		// Map size chart images to categories
// 		sizeCharts.forEach((chart) => {
// 			const simpleCategory = getSimplifiedCategoryKey(chart.category);
// 			if (categoriesData[simpleCategory]) {
// 				categoriesData[simpleCategory].sizeChartImage = chart.image;
// 			}
// 		});

// 		// Sort years descending (newest first) for each category
// 		Object.keys(categoriesData).forEach((cat) => {
// 			categoriesData[cat].years.sort((a, b) => b - a);
// 		});

// 		res.status(200).json({
// 			success: true,
// 			brand,
// 			data: categoriesData,
// 		});
// 	} catch (error) {
// 		console.error("Navbar API Error:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Internal server error",
// 			error: error.message,
// 		});
// 	}
// };


// module.exports = {
// 	getProducts,
// 	footerApi,
// 	getProductById,
// 	updateProduct,
// 	deleteProduct,
// 	getProductByBrand,
// 	navbar,
// };



const Product = require("../models/Product");
const Release = require("../models/Release");
const SizeChart = require("../models/SizeChart");
const { successResponse, errorResponse } = require("../utils/responseUtils");
const { saveImagesToDisk, deleteImageFromDisk } = require("../utils/fileUtils");

const getProducts = async (req, res) => {
	try {
		const {
			brand,
			year,
			versionName,
			category,
			style,
			page = 1,
			limit = 10,
		} = req.query;
		console.log("request quary", req.query);

		// Build filter
		const filter = {};
		if (brand) filter.brand = brand;
		if (year) filter.year = Number(year);
		if (versionName) filter.versionName = versionName;
		if (category) filter.category = category;
		if (style) filter.style = { $regex: style, $options: "i" };

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Execute query - Sort by style alphanumerically
		const [products, total] = await Promise.all([
			Product.find(filter)
				.skip(skip)
				.limit(Number(limit))
				.sort({ style: 1 }) // Sort by style ascending
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
		console.log("Brand:", brand);

		if (!brand) {
			return errorResponse(res, 400, "Brand is required");
		}

		// Find the published release for the brand
		const publishedReleases = await Release.find({ brand, isPublished: true });

		if (!publishedReleases || publishedReleases.length === 0) {
			return res.status(200).json({
				success: false,
				message: "No published release found",
				data: {
					products: [],
					categories: [],
					years: [],
				},
			});
		}

		console.log("Published releases found:", publishedReleases.length);

		// Extract all years, versionNames, and categories from published releases
		const years = publishedReleases.map((release) => release.year);
		const versionNames = publishedReleases.map(
			(release) => release.versionName
		);
		const categories = publishedReleases.map((release) => release.category);

		// Fetch products for ALL published releases
		const products = await Product.find({
			brand,
			year: { $in: years },
			versionName: { $in: versionNames },
			category: { $in: categories },
		});

		if (!products || products.length === 0) {
			return res.status(200).json({
				success: false,
				message: "No products available",
				data: {
					products: [],
					categories: [],
					years: [],
				},
			});
		}

		// 🧠 Fetch all unique categories and years from the actual products
		const uniqueCategories = await Product.distinct("category", {
			brand,
			year: { $in: years },
			versionName: { $in: versionNames },
		});

		const uniqueYears = await Product.distinct("year", {
			brand,
			year: { $in: years },
			versionName: { $in: versionNames },
		});

		console.log("Fetched products:", products.length);
		console.log("Categories:", uniqueCategories);
		console.log("Years:", uniqueYears);

		return res.status(200).json({
			success: true,
			message: "Products fetched successfully",
			data: {
				products,
				categories: uniqueCategories,
				years: uniqueYears,
			},
		});
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
		const { price, size, colors, availability, imagesToDelete } = req.body;
		console.log("reqbody ", req.body);
		const product = await Product.findById(id);

		if (!product) {
			return errorResponse(res, 404, "Product not found");
		}

		// Update fields
		if (price !== undefined) product.price = Number(price);
		if (size !== undefined) product.size = size;
		if (availability !== undefined) product.availability = availability;
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

const footerApi = async (req, res) => {
	try {
		const { brand } = req.body;

		if (!brand) {
			return res.status(400).json({
				success: false,
				message: "Brand name is required",
			});
		}

		// Find published releases for that brand
		const publishedReleases = await Release.find({
			brand,
			isPublished: true,
		});

		if (!publishedReleases || publishedReleases.length === 0) {
			return res.status(404).json({
				success: false,
				message: `No published releases found for brand: ${brand}`,
			});
		}

		// Group years by category
		const categoryYears = {};

		publishedReleases.forEach((release) => {
			if (!categoryYears[release.category]) {
				categoryYears[release.category] = [];
			}
			if (!categoryYears[release.category].includes(release.year)) {
				categoryYears[release.category].push(release.year);
			}
		});

		// Sort years descending for each category
		Object.keys(categoryYears).forEach((cat) => {
			categoryYears[cat].sort((a, b) => b - a);
		});

		res.status(200).json({
			success: true,
			brand,
			data: categoryYears,
		});
	} catch (error) {
		console.error("Footer API Error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};
const getSimplifiedCategoryKey = (category) => {
	if (!category || typeof category !== "string") return "Other";
	const lowerCat = category.toLowerCase();

	// Standardize 'Prom' categories
	if (lowerCat.includes("prom")) {
		return "Prom";
	}
	// Standardize 'Bridal' categories
	if (lowerCat.includes("bridal") || lowerCat.includes("wedding")) {
		return "Bridal";
	}
	// Standardize 'Evening' categories
	if (lowerCat.includes("evening") || lowerCat.includes("cocktail")) {
		return "Evening";
	}
	// Use the original category as a fallback if no keywords match
	return category;
};

const navbar = async (req, res) => {
	try {
		const { brand } = req.body;

		if (!brand) {
			return res.status(400).json({
				success: false,
				message: "Brand name is required",
			});
		}

		// Fetch all published releases for the brand
		const publishedReleases = await Release.find({
			brand,
			isPublished: true,
		});

		if (!publishedReleases || publishedReleases.length === 0) {
			return res.status(404).json({
				success: false,
				message: `No published releases found for brand: ${brand}`,
			});
		}

		// Structure: { simpleCategory: { years: [...], sizeChartImage: 'path/to/img' } }
		const categoriesData = {};
		const categoriesToFetch = new Set();

		publishedReleases.forEach((release) => {
			const simpleCategory = getSimplifiedCategoryKey(release.category);
			categoriesToFetch.add(simpleCategory);

			if (!categoriesData[simpleCategory]) {
				categoriesData[simpleCategory] = {
					years: [],
					sizeChartImage: null,
				};
			}
			// Add the year if it doesn't already exist
			if (!categoriesData[simpleCategory].years.includes(release.year)) {
				categoriesData[simpleCategory].years.push(release.year);
			}
		});

		// Fetch Size Chart Images
		const uniqueCategories = Array.from(categoriesToFetch);
		const sizeCharts = await SizeChart.find({
			brand: brand,
			category: { $in: uniqueCategories },
		});

		// Map size chart images to categories
		sizeCharts.forEach((chart) => {
			const simpleCategory = getSimplifiedCategoryKey(chart.category);
			if (categoriesData[simpleCategory]) {
				categoriesData[simpleCategory].sizeChartImage = chart.image;
			}
		});

		// Sort years descending (newest first) for each category
		Object.keys(categoriesData).forEach((cat) => {
			categoriesData[cat].years.sort((a, b) => b - a);
		});

		res.status(200).json({
			success: true,
			brand,
			data: categoriesData,
		});
	} catch (error) {
		console.error("Navbar API Error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

const createProduct = async (req, res) => {
	try {
		const { brand, year, versionName, category, style, price, size, colors } =
			req.body;

		// Validate required fields
		if (
			!brand ||
			!year ||
			!versionName ||
			!category ||
			!style ||
			!price ||
			!size ||
			!colors
		) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields",
			});
		}

		// Create new product
		const newProduct = new Product({
			brand,
			year: parseInt(year),
			versionName,
			category,
			style,
			price: Number(price),
			size,
			colors:
				typeof colors === "string"
					? colors.split(",").map((c) => c.trim())
					: colors,
			images: [],
			availability: "Yes",
		});

		// Handle image upload
		if (req.files && req.files.images) {
			const imageFiles = req.files.images;
			const imagePaths = imageFiles.map((file) => file.filename || file.path);
			newProduct.images = imagePaths;
		}

		await newProduct.save();

		return res.status(201).json({
			success: true,
			message: "Product created successfully",
			data: newProduct,
		});
	} catch (error) {
		console.error("Create product error:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to create product",
			error: error.message,
		});
	}
};
const availability = async (req, res) => {
	try {
		const { availability } = req.body;

		if (typeof availability !== "boolean") {
			return res.status(400).json({
				message: "Invalid availability value (must be true or false)",
			});
		}

		const product = await Product.findByIdAndUpdate(
			req.params.id,
			{ availability },
			{ new: true }
		).select("availability");

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		res.json({
			message: "Availability updated successfully",
			availability: product.availability,
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};
const frontView = async (req, res) => {
	try {
		const { viewInfront } = req.body;

		console.log(viewInfront);

		// Corrected condition: check if it's NOT a boolean
		if (typeof viewInfront !== "boolean") {
			return res.status(400).json({
				message: "Invalid viewInfront value (must be true or false)",
			});
		}

		const product = await Product.findByIdAndUpdate(
			req.params.id,
			{ viewInfront },
			{ new: true }
		).select("viewInfront");

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		res.json({
			message: "ViewInfront updated successfully",
			viewInfront: product.viewInfront, // Fixed: should be viewInfront, not availability
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
};

module.exports = {
	getProducts,
	footerApi,
	getProductById,
	updateProduct,
	deleteProduct,
	getProductByBrand,
	navbar,
	availability,
	createProduct,
	frontView
};
