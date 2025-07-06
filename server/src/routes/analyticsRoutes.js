const express = require("express");
const router = express.Router();
const {
  getSalesSummary,
  getTopProducts,
  getSalesTrend,
  getOrderStatusDistribution,
  getCategorySales,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middleware");

// All routes here are protected and require a valid token
// The authMiddleware will add the userData to the request object

router.get("/sales-summary", authMiddleware, getSalesSummary);
router.get("/top-products", authMiddleware, getTopProducts);
router.get("/sales-trend", authMiddleware, getSalesTrend);
router.get("/order-status", authMiddleware, getOrderStatusDistribution);
router.get("/category-sales", authMiddleware, getCategorySales);

module.exports = router;