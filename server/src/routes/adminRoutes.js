const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware");

// Dashboard routes
router.get(
  "/admin/dashboard/summary",
  verifyAdmin,
  adminController.getDashboardSummary
);
router.get(
  "/admin/dashboard/recent-activity",
  verifyAdmin,
  adminController.getRecentActivity
);
router.get(
  "/admin/categories/stats",
  verifyAdmin,
  adminController.getCategoryStats
);
router.get(
  "/admin/products/stats",
  verifyAdmin,
  adminController.getProductStats
);

// User management
router.get("/admin/users/farmers", verifyAdmin, adminController.getFarmers);
router.post("/admin/users", verifyAdmin, adminController.createUser);
router.get("/admin/users", verifyAdmin, adminController.getAllUsers);
router.get("/admin/users/:id", verifyAdmin, adminController.getUserById);
router.put("/admin/users/:id", verifyAdmin, adminController.updateUser);
router.delete("/admin/users/:id", verifyAdmin, adminController.deleteUser);

// Product management
router.get("/admin/products", verifyAdmin, adminController.getAllProducts);
router.put("/admin/products/:id", verifyAdmin, adminController.updateProduct);
router.delete(
  "/admin/products/:id",
  verifyAdmin,
  adminController.deleteProduct
);

// Order management
router.get("/admin/orders", verifyAdmin, adminController.getAllOrders);
router.get("/admin/orders/:id", verifyAdmin, adminController.getOrderById);
router.put("/admin/orders/:id", verifyAdmin, adminController.updateOrderStatus);
router.delete("/admin/orders/:id", verifyAdmin, adminController.deleteOrder);

// Category management
router.get("/admin/categories", verifyAdmin, adminController.getAllCategories);
router.post("/admin/categories", verifyAdmin, adminController.createCategory);
router.put(
  "/admin/categories/:id",
  verifyAdmin,
  adminController.updateCategory
);
router.delete(
  "/admin/categories/:id",
  verifyAdmin,
  adminController.deleteCategory
);

module.exports = router;
