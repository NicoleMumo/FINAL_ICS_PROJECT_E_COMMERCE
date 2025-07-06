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

// Get orders for the authenticated farmer
exports.getMyOrders = async (req, res) => {
  try {
    const farmerId = req.userData.userId;
    // Find orders where any order item is for a product owned by this farmer
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              farmerId: farmerId,
            },
          },
        },
      },
      include: {
        user: true,
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
    console.error("Error fetching farmer's orders:", error);
    res.status(500).json({ message: "Failed to fetch your orders." });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { status } = req.body;
    const { userId: farmerId, role } = req.userData;

    // Validate status
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

    // Find the order to check for ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Authorization Check: Ensure the user is an admin or the farmer associated with the order
    const isOwner = order.items.some(
      (item) => item.product.farmerId === farmerId
    );

    if (role !== "ADMIN" && !isOwner) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to update this order.",
      });
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
