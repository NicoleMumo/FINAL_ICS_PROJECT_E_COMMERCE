// server/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyAuth } = require("../middleware");

// Ensure uploads folder exists
const fs = require("fs");
const uploadsDir = require("path").join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.get("/products", productController.getProducts);
// IMPORTANT: Define specific routes like '/my' before parameterized routes like '/:id'
router.get("/products/my", verifyAuth, productController.getMyProducts);
router.get("/products/:id", productController.getProductById);

router.post(
  "/products",
  verifyAuth,
  (req, res, next) => {
    productController.upload(req, res, function (err) {
      if (err) {
        // Multer error
        return res
          .status(400)
          .json({ message: "Multer error: " + err.message });
      }
      next();
    });
  },
  productController.addProduct
);

router.patch(
  "/products/:id",
  verifyAuth,
  productController.upload,
  productController.updateProduct
);

router.delete("/products/:id", verifyAuth, productController.deleteProduct);

// Admin routes for products
router.post(
  "/admin/products",
  verifyAuth,
  productController.upload,
  productController.adminAddProduct
);
router.put(
  "/admin/products/:id",
  verifyAuth,
  productController.upload,
  productController.adminUpdateProduct
);

// Route for updating only stock (more efficient for inventory management)
router.patch("/products/:id/stock", verifyAuth, productController.updateStock);



module.exports = router;
