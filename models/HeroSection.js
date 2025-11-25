const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema(
	{
		brand: {
			type: String,
			required: true,
			enum: ["Azure", "Monsini", "Risky"],
		},
		
		media: [
			{
				url: {
					type: String,
					required: true,
				},
				type: {
					type: String,
					required: true,
					enum: ["image", "video"],
				},
				filename: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("HeroSecti", heroSectionSchema);
