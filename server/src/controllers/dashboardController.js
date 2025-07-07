const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getFarmerRevenue } = require("./analyticsController");

exports.getDashboardData = async (req, res) => {
  try {
    const farmerId = req.userData.userId;

    // Parallelize queries for efficiency
    const [
      summaryData,
      recentProducts,
      recentOrders,
      topSellingProductsResult,
    ] = await Promise.all([
      // 1. Get Summary Data
      (async () => {
        const totalProducts = await prisma.product.count({
          where: { farmerId },
        });

        const pendingOrders = await prisma.order.count({
          where: {
            status: "PENDING",
            items: { some: { product: { farmerId } } },
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

        const monthlySales = await getFarmerRevenue(farmerId, {
          order: {
            status: "SHIPPED",
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        const lowStockItems = await prisma.product.count({
          where: {
            farmerId,
            stock: {
              lt: 10,
            },
          },
        });

        return { totalProducts, pendingOrders, monthlySales, lowStockItems };
      })(),

      // 2. Get Recent Product Listings
      prisma.product.findMany({
        where: { farmerId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, stock: true, imageUrl: true },
      }),

      // 3. Get Recent Orders
      prisma.order.findMany({
        where: { items: { some: { product: { farmerId } } } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, id: true } }, // The buyer
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),

      // 4. Get Top Selling Products
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { product: { farmerId } },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 5,
      }),
    ]);

    // Post-process top selling products to include names
    const productIds = topSellingProductsResult.map((item) => item.productId);
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

    const topSellingProducts = topSellingProductsResult.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product ? product.name : "Unknown Product",
        sales: item._sum.quantity || 0,
      };
    });

    res.json({
      summaryData,
      recentProducts,
      recentOrders,
      topSellingProducts,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};


