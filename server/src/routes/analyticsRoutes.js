const express = require("express");
const router = express.Router();
const {
  getSalesSummary,
  getTopProducts,
  getSalesTrend,
  getOrderStatusDistribution,
  getCategorySales,
} = require("../controllers/analyticsController");
const { verifyAuth } = require("../middleware");

// All routes here are protected and require a valid token
// The authMiddleware will add the userData to the request object

router.get("/sales-summary", verifyAuth, getSalesSummary);
router.get("/top-products", verifyAuth, getTopProducts);
router.get("/sales-trend", verifyAuth, getSalesTrend);
router.get("/order-status", verifyAuth, getOrderStatusDistribution);
router.get("/category-sales", verifyAuth, getCategorySales);

module.exports = router;