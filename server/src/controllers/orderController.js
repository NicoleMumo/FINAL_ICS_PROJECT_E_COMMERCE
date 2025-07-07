// server/src/controllers/orderController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getPesapalToken, submitPesapalOrder } = require('../utils/pesapal');

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

// Create order and initiate Pesapal payment
exports.createOrder = async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }
    // Get user and cart details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Get product details and calculate total
    let total = 0;
    const orderItems = await Promise.all(items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error('Product not found');
      if (product.stock < item.quantity) throw new Error('Insufficient stock');
      total += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    }));
    // Create order and order items
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });
    // Pesapal payment
    const pesapalToken = await getPesapalToken();
    const pesapalRes = await submitPesapalOrder({
      id: order.id,
      amount: total,
      currency: 'KES',
      description: 'Farm produce order',
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      phone_number: user.phone,
      token: pesapalToken,
    });
    // Optionally save pesapal tracking id to order
    await prisma.order.update({ where: { id: order.id }, data: { pesapalTrackingId: pesapalRes.order_tracking_id || null } });
    res.json({ orderId: order.id, payment: pesapalRes });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Failed to create order.' });
  }
};

// Pesapal payment callback webhook
exports.pesapalCallback = async (req, res) => {
  try {
    const { MerchantReference, PaymentStatus } = req.body;
    if (!MerchantReference) return res.status(400).json({ message: 'Missing MerchantReference.' });
    // Find order
    const order = await prisma.order.findUnique({ where: { id: MerchantReference }, include: { items: { include: { product: true } } } });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (PaymentStatus === 'COMPLETED') {
      // Update order status
      await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
      // For each order item: decrease stock, add to farmer balance
      for (const item of order.items) {
        // Decrease product stock
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        // Add to farmer balance
        await prisma.user.update({ where: { id: item.product.farmerId }, data: { balance: { increment: item.price * item.quantity } } });
      }
    }
    res.json({ message: 'Callback processed.' });
  } catch (error) {
    console.error('Pesapal callback error:', error);
    res.status(500).json({ message: 'Failed to process callback.' });
  }
};
