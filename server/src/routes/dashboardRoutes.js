const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyAuth } = require("../middleware");

// A single, secure endpoint for all farmer dashboard data
router.get(
  "/dashboard",
  verifyAuth,
  dashboardController.getDashboardData
);

module.exports = router;
