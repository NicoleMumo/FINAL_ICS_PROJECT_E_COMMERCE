// server/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController"); // <-- Fix: import the whole controller
const authMiddleware = require("../middleware");

// Ensure uploads folder exists
const fs = require("fs");
const uploadsDir = require("path").join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get("/products", productController.getProducts);
// IMPORTANT: Define specific routes like '/my' before parameterized routes like '/:id'
router.get("/products/my", authMiddleware, productController.getMyProducts);
router.get("/products/:id", productController.getProductById);

router.post(
  "/products",
  authMiddleware,
  (req, res, next) => {
    productController.upload(req, res, function (err) {
      if (err) {
        // Multer error
        return res.status(400).json({ message: "Multer error: " + err.message });
      }
      next();
    });
  },
  productController.addProduct
);
router.put(
  "/products/:id",
  authMiddleware,
  productController.upload,
  productController.updateProduct
); // <-- Allow image update

router.delete("/products/:id", authMiddleware, productController.deleteProduct);

// Route for updating only stock (more efficient for inventory management)
router.patch(
  "/products/:id/stock",
  authMiddleware,
  productController.updateStock
);

module.exports = router;
