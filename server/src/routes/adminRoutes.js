const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// User management
router.get('/admin/users', adminController.getAllUsers);
router.get('/admin/users/:id', adminController.getUserById);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);

// Product management
router.get('/admin/products', adminController.getAllProducts);
router.put('/admin/products/:id', adminController.updateProduct);
router.delete('/admin/products/:id', adminController.deleteProduct);

// Order management
router.get('/admin/orders', adminController.getAllOrders);
router.get('/admin/orders/:id', adminController.getOrderById);
router.put('/admin/orders/:id/status', adminController.updateOrderStatus);

// Category management
router.get('/admin/categories', adminController.getAllCategories);
router.post('/admin/categories', adminController.createCategory);
router.put('/admin/categories/:id', adminController.updateCategory);
router.delete('/admin/categories/:id', adminController.deleteCategory);

// Analytics / summary
router.get('/admin/summary', adminController.getAdminSummary);

module.exports = router; 