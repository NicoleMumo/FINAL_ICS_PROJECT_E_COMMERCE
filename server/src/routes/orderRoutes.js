// server/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware");
router.get("/orders", orderController.getOrders);
router.get("/orders/my", authMiddleware, orderController.getMyOrders);
router.patch("/orders/:id/status", authMiddleware, orderController.updateOrderStatus);
router.post("/orders", orderController.createOrder);
router.post("/payment-callback", orderController.pesapalCallback);

module.exports = router;
