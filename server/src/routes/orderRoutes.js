// server/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware");

// Pesapal payment routes (if needed)
// const { initiatePesapalPayment, handlePesapalIPN } = require('../controllers/orderController');
// const { isAuthenticated } = require('../middleware');
// router.post('/initiate-payment', isAuthenticated, initiatePesapalPayment);
// router.post('/ipn', handlePesapalIPN);

// Order routes
router.get("/orders", orderController.getOrders);
router.get("/orders/my", authMiddleware, orderController.getMyOrders);
router.patch("/orders/:id/status", authMiddleware, orderController.updateOrderStatus);
router.post("/orders", orderController.createOrder);
router.post("/payment-callback", orderController.pesapalCallback);

module.exports = router;
