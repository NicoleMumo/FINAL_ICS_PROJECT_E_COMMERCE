// server/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController"); // Path adjusted

router.get("/orders", orderController.getOrders);
router.patch("/orders/:id/status", orderController.updateOrderStatus);

module.exports = router;
