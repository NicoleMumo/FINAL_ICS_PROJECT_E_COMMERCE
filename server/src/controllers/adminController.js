const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get a single user's details (including phone and email)
exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user (name, email, phone, role)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, phone, role },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// --- PRODUCT MANAGEMENT ---
// List all products
exports.getAllProducts = async (req, res) => {
  try {
    console.log('Fetching all products for admin...');
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        farmer: { select: { name: true, email: true } },
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price, stock, categoryId },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// --- ORDER MANAGEMENT ---
// List all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order details
exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// --- CATEGORY MANAGEMENT ---
// List all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Add a category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// --- ANALYTICS / SUMMARY ---
exports.getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalSalesResult = await prisma.order.aggregate({ _sum: { total: true } });
    const totalSales = totalSalesResult._sum.total || 0;
    res.json({ totalUsers, totalProducts, totalOrders, totalSales });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
}; 