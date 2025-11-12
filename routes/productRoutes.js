const express = require("express");
const {
	getProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	getProductByBrand,
	footerApi,
	navbar,
} = require("../controllers/productController");
const upload = require("../middleware/upload");
const Product = require("../models/Product");


const router = express.Router();

// GET all products
router.get("/", getProducts);

// GET products by brand
router.post("/brand", getProductByBrand);

router.post("/footers", footerApi);

router.post("/navbar", navbar);



// GET single product by ID
router.get("/:id", getProductById);

// CREATE new product - SIMPLE VERSION FIRST
router.post(
	"/",
	upload.fields([{ name: "images", maxCount: 10 }]),
	async (req, res) => {
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
	}
);

// UPDATE product with images
router.patch(
	"/:id",
	upload.fields([{ name: "images", maxCount: 10 }]),
	updateProduct
);

// UPDATE product availability only
router.patch("/:id/availability", async (req, res) => {
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
});

router.patch("/:id/viewInfront", async (req, res) => {
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
});
// DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;
