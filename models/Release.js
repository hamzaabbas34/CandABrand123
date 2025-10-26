const mongoose = require("mongoose");

const releaseSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: true,
		enum: ["Azure", "Monsini", "Risky"],
	},
	year: {
		type: Number,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	versionName: {
		type: String,
		required: true,
	},
	totalProduct: {
		type: Number,
		required: true,
	},
	isPublished: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

const Release = mongoose.model("Release", releaseSchema);

module.exports = Release;
