const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: true,
		enum: ["Azure", "Monsini", "Risky"],
	},
	year: {
		type: Number,
		required: true,
	},
	versionName: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	style: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	colors: [
		{
			type: String,
		},
	],
	size: {
		type: String,
		required: true,
	},
	images: [
		{
			type: String,
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});



const Product = mongoose.model("Product", productSchema);

module.exports = Product;
