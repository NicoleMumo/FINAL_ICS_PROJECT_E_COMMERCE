const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware');

// Dashboard routes
router.get('/api/admin/dashboard/summary', verifyAdmin, adminController.getDashboardSummary);
router.get('/api/admin/dashboard/recent-activity', verifyAdmin, adminController.getRecentActivity);
router.get('/api/admin/categories/stats', verifyAdmin, adminController.getCategoryStats);
router.get('/api/admin/products/stats', verifyAdmin, adminController.getProductStats);

// User management
router.get('/api/admin/users', verifyAdmin, adminController.getAllUsers);
router.get('/api/admin/users/:id', verifyAdmin, adminController.getUserById);
router.put('/api/admin/users/:id', verifyAdmin, adminController.updateUser);
router.delete('/api/admin/users/:id', verifyAdmin, adminController.deleteUser);

// Product management
router.get('/api/admin/products', verifyAdmin, adminController.getAllProducts);
router.put('/api/admin/products/:id', verifyAdmin, adminController.updateProduct);
router.delete('/api/admin/products/:id', verifyAdmin, adminController.deleteProduct);

// Order management
router.get('/api/admin/orders', verifyAdmin, adminController.getAllOrders);
router.get('/api/admin/orders/:id', verifyAdmin, adminController.getOrderById);
router.put('/api/admin/orders/:id', verifyAdmin, adminController.updateOrderStatus);
router.delete('/api/admin/orders/:id', verifyAdmin, adminController.deleteOrder);

// Category management
router.get('/api/admin/categories', verifyAdmin, adminController.getAllCategories);
router.post('/api/admin/categories', verifyAdmin, adminController.createCategory);
router.put('/api/admin/categories/:id', verifyAdmin, adminController.updateCategory);
router.delete('/api/admin/categories/:id', verifyAdmin, adminController.deleteCategory);

module.exports = router; 