const mongoose = require("mongoose");
const Release = require("../models/Release");
const { successResponse, errorResponse } = require("../utils/responseUtils");

const publishVersion = async (req, res) => {
	try {
		const { brand, year, versionName } = req.body;

		console.log("Publish request:", { brand, year, versionName });
		if (!brand || !year || !versionName) {
			return errorResponse(
				res,
				400,
				"Brand, year, and versionName are required"
			);
		}

		// Find the release to publish
		const releaseToPublish = await Release.findOne({
			brand,
			year: Number(year),
			versionName,
		});

		if (!releaseToPublish) {
			return errorResponse(res, 404, "Release not found");
		}

		// Get the category from the release document
		const category = releaseToPublish.category;

		if (!category) {
			return errorResponse(res, 400, "Release does not have a category");
		}

		// Unpublish all releases for this brand AND category (same season/category)
		await Release.updateMany(
			{
				brand,
				category, // Same category (like "Prom 2025")
				isPublished: true,
				_id: { $ne: releaseToPublish._id }, // Don't unpublish the current one
			},
			{ $set: { isPublished: false, updatedAt: new Date() } }
		);

		// Publish the selected release
		releaseToPublish.isPublished = true;
		releaseToPublish.updatedAt = new Date();
		await releaseToPublish.save();

		return successResponse(
			res,
			{
				...releaseToPublish.toObject(),
				category: category,
			},
			`Version '${versionName}' published successfully for ${category}. Other versions in same category have been unpublished.`
		);
	} catch (error) {
		console.error("Publish error:", error);
		return errorResponse(res, 500, "Failed to publish version", error.message);
	}
};
const getPublishedVersion = async (req, res) => {
	try {
		const { brand } = req.params;

		const published = await Release.findOne({
			brand,
			isPublished: true,
		}).lean();

		if (!published) {
			return successResponse(res, null, "No published version found");
		}

		return successResponse(res, published);
	} catch (error) {
		console.error("Get published version error:", error);
		return errorResponse(
			res,
			500,
			"Failed to fetch published version",
			error.message
		);
	}
};

module.exports = {
	publishVersion,
	getPublishedVersion,
};
