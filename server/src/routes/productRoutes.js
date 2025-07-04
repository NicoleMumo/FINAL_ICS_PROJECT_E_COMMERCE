// server/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // Path adjusted
const authMiddleware = require("../middleware");

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", authMiddleware, productController.addProduct);
router.put("/products/:id", productController.updateProduct);
router.patch("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
