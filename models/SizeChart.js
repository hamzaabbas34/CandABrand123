const mongoose = require("mongoose");

const sizeChartSchema = new mongoose.Schema({
	image: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	brand: {
		type: String,
		required: true,
	},
	year: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const SizeChart = mongoose.model("SizeChart", sizeChartSchema);

module.exports = SizeChart;
