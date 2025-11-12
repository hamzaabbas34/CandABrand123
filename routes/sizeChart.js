const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const SizeChart = require("../models/SizeChart"); // Adjust path if needed

const router = express.Router();

// --- 1. MULTER CONFIGURATION (Uploads to top-level 'uploads' folder) ---

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Correct path to reach the top-level /uploads folder from a nested router file
		// /routes -> /backend -> / (Root Project Folder)
		const sizeChartDir = path.join(__dirname, "../../uploads/sizeCharts");

		if (!fs.existsSync(sizeChartDir)) {
			fs.mkdirSync(sizeChartDir, { recursive: true });
		}
		cb(null, sizeChartDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

const getAbsolutePath = (relativePath) => {
	return path.join(__dirname, "../../", relativePath);
};

router.get("/", async (req, res) => {
	try {
		const sizeCharts = await SizeChart.find();
		res.status(200).json(sizeCharts);
	} catch (error) {
		console.error("Error fetching size charts:", error);
		res.status(500).json({ error: "Error fetching size charts" });
	}
});

router.post("/", upload.single("image"), async (req, res) => {
	try {
		const { category, year, brand } = req.body;

		if (!req.file) {
			return res.status(400).json({ error: "Image file is required" });
		}

		const filePath = `uploads/sizeCharts/${req.file.filename}`;

		const newChart = new SizeChart({
			image: filePath,
			category: category?.replace(/['"]+/g, ""),
			brand: brand?.replace(/['"]+/g, ""),
			year,
		});

		await newChart.save();

		res.status(201).json({
			message: "Size chart uploaded successfully",
			newChart,
		});
	} catch (error) {
		console.error("Error creating size chart:", error);
		// Clean up the file if it was uploaded but the DB save failed
		if (req.file) {
			try {
				fs.unlinkSync(getAbsolutePath(filePath));
			} catch (e) {
				console.error("Cleanup failed:", e);
			}
		}
		res.status(500).json({ error: "Error uploading size chart" });
	}
});

router.put("/:id", upload.single("image"), async (req, res) => {
	try {
		const { id } = req.params;
		const { category, year, brand } = req.body;
		const updateData = {
			category: category?.replace(/['"]+/g, ""),
			brand: brand?.replace(/['"]+/g, ""),
			year,
		};

		const existingChart = await SizeChart.findById(id);
		if (!existingChart) {
			// If the record doesn't exist, delete the newly uploaded file (if any)
			if (req.file) {
				fs.unlinkSync(
					getAbsolutePath(`uploads/sizeCharts/${req.file.filename}`)
				);
			}
			return res.status(404).json({ error: "Size chart not found" });
		}

		// Check if a new file was uploaded (i.e., replacing the image)
		if (req.file) {
			const oldImagePath = existingChart.image;
			const newFilename = req.file.filename;

			// 1. Update the image path in the update data
			updateData.image = `uploads/sizeCharts/${newFilename}`;

			// 2. Delete the old file from the file system
			if (oldImagePath) {
				const oldAbsolutePath = getAbsolutePath(oldImagePath);
				if (fs.existsSync(oldAbsolutePath)) {
					// Use fs.unlinkSync for simple deletion
					fs.unlinkSync(oldAbsolutePath);
					console.log(`Successfully deleted old file: ${oldImagePath}`);
				}
			}
		}

		// Update the document in the database
		const updatedChart = await SizeChart.findByIdAndUpdate(
			id,
			{ $set: updateData },
			{ new: true } // Return the updated document
		);

		res.status(200).json({
			message: "Size chart updated successfully",
			updatedChart,
		});
	} catch (error) {
		console.error("Error updating size chart:", error);
		// Clean up the new file if it was uploaded but the update failed
		if (req.file) {
			try {
				fs.unlinkSync(
					getAbsolutePath(`uploads/sizeCharts/${req.file.filename}`)
				);
			} catch (e) {
				console.error("Cleanup new file failed:", e);
			}
		}
		res.status(500).json({ error: "Error updating size chart" });
	}
});

router.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const chartToDelete = await SizeChart.findByIdAndDelete(id);

		if (!chartToDelete) {
			return res.status(404).json({ error: "Size chart not found" });
		}

		const filePath = chartToDelete.image;

		// Delete the associated file from the server
		if (filePath) {
			const absolutePath = getAbsolutePath(filePath);
			if (fs.existsSync(absolutePath)) {
				fs.unlinkSync(absolutePath);
				console.log(`Successfully deleted file: ${filePath}`);
			} else {
				console.warn(
					`File not found on disk, but deleted from DB: ${filePath}`
				);
			}
		}

		res.status(200).json({
			message: "Size chart deleted successfully",
			deletedChart: chartToDelete,
		});
	} catch (error) {
		console.error("Error deleting size chart:", error);
		res.status(500).json({ error: "Error deleting size chart" });
	}
});

module.exports = router;
