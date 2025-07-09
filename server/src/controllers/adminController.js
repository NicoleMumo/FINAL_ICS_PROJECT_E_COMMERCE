const prisma = require("../prisma");
const bcrypt = require("bcryptjs");

// Dashboard Summary with Growth Metrics
exports.getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

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
      transactionVolume,
    ] = await Promise.all([
      // Current totals
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      // Last month totals for growth calculation
      prisma.user.count({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            lt: lastMonth,
          },
        },
        _sum: {
          total: true,
        },
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
      `,
    ]);

    // Convert BigInt to Number for revenue and lastMonthRevenue
    const revenueTotal = revenue._sum.total ? Number(revenue._sum.total) : 0;
    const lastMonthRevenueTotal = lastMonthRevenue._sum.total ? Number(lastMonthRevenue._sum.total) : 0;

    // Calculate growth percentages
    const userGrowthPercent = (
      ((totalUsers - lastMonthUsers) / (lastMonthUsers || 1)) * 100
    ).toFixed(1);
    const orderGrowthPercent = (
      ((totalOrders - lastMonthOrders) / (lastMonthOrders || 1)) * 100
    ).toFixed(1);
    const revenueGrowthPercent = (
      ((revenueTotal - lastMonthRevenueTotal) / (lastMonthRevenueTotal || 1)) * 100
    ).toFixed(1);

    // Helper to recursively convert BigInt to Number
    function convertBigInt(obj) {
      if (typeof obj === 'bigint') return Number(obj);
      if (Array.isArray(obj)) return obj.map(convertBigInt);
      if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, convertBigInt(v)])
        );
      }
      return obj;
    }

    res.json(convertBigInt({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: revenueTotal,
      growth: {
        users: userGrowthPercent,
        orders: orderGrowthPercent,
        revenue: revenueGrowthPercent,
      },
      userGrowth,
      transactionVolume,
    }));
  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({
      message: "Error getting dashboard summary",
      error: error.message,
    });
  }
};

// Recent Activity
exports.getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Combine and format activities
    const activities = [
      ...recentOrders.map((order) => ({
        id: order.id,
        user: order.user,
        action: `Placed order #${order.id}`,
        date: order.createdAt,
        status: order.status,
        type: "order",
      })),
      ...recentProducts.map((product) => ({
        id: product.id,
        user: product.farmer,
        action: `Added new product: ${product.name}`,
        date: product.createdAt,
        status: "Active",
        type: "product",
      })),
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    res
      .status(500)
      .json({ message: "Error getting recent activity", error: error.message });
  }
};

// Category Statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    const categoryStats = categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category.products.length,
      totalSales: category.products.reduce(
        (total, product) => total + product.orderItems.length,
        0
      ),
    }));

    res.json(categoryStats);
  } catch (error) {
    console.error("Error getting category stats:", error);
    res.status(500).json({
      message: "Error getting category statistics",
      error: error.message,
    });
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
            name: true,
          },
        },
        orderItems: true,
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
    });

    const productStats = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      farmer: product.farmer,
      totalSales: product.orderItems.length,
    }));

    res.json(productStats);
  } catch (error) {
    console.error("Error getting product stats:", error);
    res.status(500).json({
      message: "Error getting product statistics",
      error: error.message,
    });
  }
};

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, sortBy, sortOrder } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });

    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid or missing user id." });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const data = { name, email, role, phone };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
      },
    });

    // Return the created user (without the password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    // Handle potential errors, like a duplicate email
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// --- PRODUCT MANAGEMENT ---
exports.getAllProducts = async (req, res) => {
  const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        farmer: { select: { id: true, name: true } },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    res
      .status(500)
      .json({ message: "Error getting products", error: error.message });
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
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

// --- ORDER MANAGEMENT ---
exports.getAllOrders = async (req, res) => {
  const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({ message: "Error getting orders", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        items: { include: { product: true } },
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
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

// --- CATEGORY MANAGEMENT ---
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error getting categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, unit } = req.body;
    const category = await prisma.category.create({ data: { name, unit } });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, unit } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name, unit },
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      select: { id: true, name: true }, // Select only needed fields
      orderBy: { name: 'asc' },
    });
    res.json(farmers);
  } catch (error) {
    console.error('Error getting farmers:', error);
    res.status(500).json({ message: 'Error getting farmers', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
