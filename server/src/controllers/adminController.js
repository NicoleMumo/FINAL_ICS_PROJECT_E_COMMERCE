const prisma = require('../prisma');

// Dashboard Summary with Growth Metrics
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Get current totals
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      lastMonthUsers,
      lastMonthOrders,
      lastMonthRevenue,
      userGrowth,
      transactionVolume
    ] = await Promise.all([
      // Current totals
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      // Last month totals for growth calculation
      prisma.user.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            lt: lastMonth
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            lt: lastMonth
          }
        },
        _sum: {
          total: true
        }
      }),
      // User growth data for chart
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `,
      // Transaction volume data for chart
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', "createdAt") as date,
          SUM(total) as amount
        FROM "Order"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY date ASC
      `
    ]);

    // Calculate growth percentages
    const userGrowthPercent = ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);
    const orderGrowthPercent = ((totalOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1);
    const revenueGrowthPercent = (((revenue._sum.total || 0) - (lastMonthRevenue._sum.total || 0)) / (lastMonthRevenue._sum.total || 1) * 100).toFixed(1);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: revenue._sum.total || 0,
      growth: {
        users: userGrowthPercent,
        orders: orderGrowthPercent,
        revenue: revenueGrowthPercent
      },
      userGrowth,
      transactionVolume
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ message: 'Error getting dashboard summary', error: error.message });
  }
};

// Recent Activity
exports.getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Combine and format activities
    const activities = [
      ...recentOrders.map(order => ({
        id: order.id,
        user: order.user,
        action: `Placed order #${order.id}`,
        date: order.createdAt,
        status: order.status,
        type: 'order'
      })),
      ...recentProducts.map(product => ({
        id: product.id,
        user: product.farmer,
        action: `Added new product: ${product.name}`,
        date: product.createdAt,
        status: 'Active',
        type: 'product'
      }))
    ].sort((a, b) => b.date - a.date).slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({ message: 'Error getting recent activity', error: error.message });
  }
};

// Category Statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: true
          }
        }
      }
    });

    const categoryStats = categories.map(category => ({
      id: category.id,
      name: category.name,
      productCount: category.products.length,
      totalSales: category.products.reduce((total, product) => 
        total + product.orderItems.length, 0
      )
    }));

    res.json(categoryStats);
  } catch (error) {
    console.error('Error getting category stats:', error);
    res.status(500).json({ message: 'Error getting category statistics', error: error.message });
  }
};

// Product Statistics
exports.getProductStats = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        farmer: {
          select: {
            name: true
          }
        },
        orderItems: true
      },
      orderBy: {
        orderItems: {
          _count: 'desc'
        }
      }
    });

    const productStats = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      farmer: product.farmer,
      totalSales: product.orderItems.length
    }));

    res.json(productStats);
  } catch (error) {
    console.error('Error getting product stats:', error);
    res.status(500).json({ message: 'Error getting product statistics', error: error.message });
  }
};

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email, phone, role },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Delete related data for referential integrity
    await prisma.order.deleteMany({ where: { userId: Number(req.params.id) } });
    await prisma.product.deleteMany({ where: { farmerId: Number(req.params.id) } });
    await prisma.cart.deleteMany({ where: { userId: Number(req.params.id) } });
    await prisma.oTP.deleteMany({ where: { userId: Number(req.params.id) } });
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// --- PRODUCT MANAGEMENT ---
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { name: true } }, farmer: { select: { name: true, email: true } } },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, description, price, stock, categoryId },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// --- ORDER MANAGEMENT ---
exports.getAllOrders = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    
    const orders = await prisma.order.findMany({
      take: limit,
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ 
      message: 'Error fetching orders',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: { include: { product: { select: { name: true } } } },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await prisma.orderItem.deleteMany({ where: { orderId: Number(req.params.id) } });
    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

// --- CATEGORY MANAGEMENT ---
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}; 