const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();

    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthlySalesResult = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const monthlySales = monthlySalesResult._sum.total || 0;

    const lowStockItems = await prisma.product.count({
      where: {
        stock: {
          lt: 10,
        },
      },
    });

    res.json({
      totalProducts,
      pendingOrders,
      monthlySales,
      lowStockItems,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      message: "Error fetching dashboard summary",
      error: error.message,
    });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
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

    const productIds = topSellingProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const result = topSellingProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product ? product.name : "Unknown Product",
        sales: item._sum.quantity || 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({
      message: "Error fetching top selling products",
      error: error.message,
    });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.json(recentOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      message: "Error fetching recent orders",
      error: error.message,
    });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lt: 10,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    res.json(lowStockProducts);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({
      message: "Error fetching low stock products",
      error: error.message,
    });
  }
};

exports.getSalesByCategory = async (req, res) => {
  try {
    const salesByCategory = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });

    const categorySales = {};

    for (const item of salesByCategory) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { categoryId: true },
      });

      if (product) {
        if (!categorySales[product.categoryId]) {
          categorySales[product.categoryId] = 0;
        }
        categorySales[product.categoryId] += item._sum.quantity || 0;
      }
    }

    res.json(categorySales);
  } catch (error) {
    console.error("Error fetching sales by category:", error);
    res.status(500).json({
      message: "Error fetching sales by category",
      error: error.message,
    });
  }
};

exports.getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({
      where: { status: "COMPLETED" },
    });
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });
    const cancelledOrders = await prisma.order.count({
      where: { status: "CANCELLED" },
    });

    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
}; 