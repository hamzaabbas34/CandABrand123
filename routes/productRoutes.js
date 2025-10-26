const express = require("express");
const {
	getProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	getProductByBrand,
} = require("../controllers/productController");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", getProducts);
router.post("/brand", getProductByBrand);
router.get("/:id", getProductById);
router.patch(
	"/:id",
	upload.fields([{ name: "images", maxCount: 10 }]),
	updateProduct
);
router.delete("/:id", deleteProduct);

module.exports = router;
