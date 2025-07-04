const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/top-selling-products', dashboardController.getTopSellingProducts);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/low-stock-products', dashboardController.getLowStockProducts);
router.get('/sales-by-category', dashboardController.getSalesByCategory);
router.get('/order-statistics', dashboardController.getOrderStatistics);

module.exports = router; 