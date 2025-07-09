const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Reusable function to get farmer revenue
async function getFarmerRevenue(farmerId, options = {}) {
  const { dateRange = {}, status } = options;

  const where = {
    product: {
      farmerId: farmerId,
    },
    ...dateRange,
  };

  if (status) {
    where.order = {
      status: status,
    };
  }

  const orderItems = await prisma.orderItem.findMany({
    where,
    select: {
      price: true,
      quantity: true,
    },
  });

  return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Get sales summary for a farmer
const getSalesSummary = async (req, res) => {
  try {
    const farmerId = req.userData.userId;
        const totalSales = await getFarmerRevenue(farmerId, { status: 'DELIVERED' });

    const totalOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            product: {
              farmerId: farmerId,
            },
          },
        },
      },
    });

    const uniqueCustomers = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              farmerId: farmerId,
            },
          },
        },
      },
      distinct: ["userId"],
    });

    res.json({
      totalSales,
      totalOrders,
      uniqueCustomers: uniqueCustomers.length,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get top selling products for a farmer
const getTopProducts = async (req, res) => {
  try {
    const farmerId = req.userData.userId;

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        product: {
          farmerId: farmerId,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productIds = topProducts.map((p) => p.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
      },
    });

    const productsMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    const result = topProducts.map((p) => ({
      ...productsMap[p.productId],
      totalSold: p._sum.quantity,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sales trend over the last 30 days
const getSalesTrend = async (req, res) => {
  try {
    const farmerId = req.userData.userId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrend = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'DELIVERED',
        createdAt: {
          gte: thirtyDaysAgo,
        },
        items: {
          some: {
            product: {
              farmerId: farmerId,
            },
          },
        },
      },
      _sum: {
        total: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format data for charting
    const formattedTrend = salesTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      sales: item._sum.total || 0,
    }));

    res.json(formattedTrend);
  } catch (error) {
    console.error("Error fetching sales trend:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order status distribution
const getOrderStatusDistribution = async (req, res) => {
  try {
    const farmerId = req.userData.userId;
    const statusDistribution = await prisma.order.groupBy({
      by: ['status'],
      where: {
        items: {
          some: {
            product: {
              farmerId: farmerId,
            },
          },
        },
      },
      _count: {
        status: true,
      },
    });

    const formattedData = statusDistribution.map(item => ({
      name: item.status,
      value: item._count.status,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching order status distribution:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sales by category
const getCategorySales = async (req, res) => {
  try {
    const farmerId = req.userData.userId;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          farmerId: farmerId,
        },
        order: {
          status: 'DELIVERED',
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    const salesByCategory = orderItems.reduce((acc, item) => {
      const categoryName = item.product.category?.name || 'Uncategorized';
      const price = item.price;
      acc[categoryName] = (acc[categoryName] || 0) + price;
      return acc;
    }, {});

    const formattedData = Object.keys(salesByCategory).map(key => ({
      name: key,
      sales: salesByCategory[key],
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching category sales:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSalesSummary,
  getTopProducts,
  getSalesTrend,
  getOrderStatusDistribution,
  getCategorySales,
  getFarmerRevenue,
};