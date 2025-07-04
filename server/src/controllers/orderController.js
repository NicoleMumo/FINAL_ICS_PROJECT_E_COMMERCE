// server/src/controllers/orderController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get orders for the farmer (or all orders for now)
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.userData.role !== "FARMER" && req.userData.role !== "ADMIN") {
      return res
        .status(403)
        .json({
          message:
            "Forbidden: You do not have permission to update order status.",
        });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid order status provided." });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: `Order status updated to ${status}.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(500).json({ message: "Failed to update order status." });
  }
};
