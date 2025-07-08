// IMPORTANT: Add these to your .env file
// PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
// PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
// PESAPAL_IPN_NOTIFICATION_ID=your_pesapal_ipn_id

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
// Use the sandbox URL for testing and production URL for live transactions
const PESAPAL_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://pay.pesapal.com/v3' 
    : 'https://cybqa.pesapal.com/pesapalv3';

// Function to get a new Pesapal access token
const getAccessToken = async () => {
    try {
        const response = await axios.post(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
            consumer_key: PESAPAL_CONSUMER_KEY,
            consumer_secret: PESAPAL_CONSUMER_SECRET,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return response.data.token;
    } catch (error) {
        console.error('Error getting Pesapal access token:', error.response ? error.response.data : error.message);
        throw new Error('Could not authenticate with Pesapal.');
    }
};

// 1. Initiate Payment Request
exports.initiatePesapalPayment = async (req, res) => {
    const { amount, currency, description, items, billing_address } = req.body;
    const { userId, email, phone_number } = req.user; // Assuming user is authenticated

    if (!amount || !currency || !description || !items || !billing_address) {
        return res.status(400).json({ error: 'Missing required payment details.' });
    }

    try {
        const token = await getAccessToken();
        const merchant_reference = `ORDER_${Date.now()}`;
        const notification_id = process.env.PESAPAL_IPN_NOTIFICATION_ID; // Get this from your Pesapal dashboard

        const orderData = {
            id: merchant_reference,
            currency,
            amount,
            description,
            callback_url: 'http://localhost:3000/payment-callback', // Your frontend callback URL
            notification_id,
            billing_address: {
                ...billing_address,
                email_address: email,
                phone_number: phone_number
            }
        };

        const response = await axios.post(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data.error) {
             return res.status(400).json({ error: response.data.error.message });
        }

        await prisma.order.create({
            data: {
                id: merchant_reference,
                userId: userId,
                amount: parseFloat(amount),
                status: 'PENDING',
                pesapalTrackingId: response.data.order_tracking_id,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                    }))
                }
            }
        });
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error initiating Pesapal payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to initiate payment.' });
    }
};

// 2. Handle Instant Payment Notification (IPN)
exports.handlePesapalIPN = async (req, res) => {
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = req.body;
    console.log('Received IPN:', req.body);

    if (OrderNotificationType === 'IPNCHANGE') {
        try {
            const token = await getAccessToken();
            const statusResponse = await axios.get(`${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const { payment_status_description } = statusResponse.data;

            if (payment_status_description === 'Completed') {
                const order = await prisma.order.findUnique({ 
                    where: { id: OrderMerchantReference },
                    include: { items: true }
                });

                if (order && order.status !== 'COMPLETED') {
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id: OrderMerchantReference },
                            data: { status: 'COMPLETED' },
                        });

                        for (const item of order.items) {
                            const product = await tx.product.findUnique({ where: { id: item.productId }});
                            if (!product) continue;

                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });

                            await tx.user.update({
                                where: { id: product.farmerId },
                                data: { balance: { increment: item.quantity * product.price } } 
                            });
                        }
                    });
                    console.log(`Order ${OrderMerchantReference} successfully processed.`);
                }
            }

            const responseText = `pesapal_notification_type=${OrderNotificationType}&pesapal_transaction_tracking_id=${OrderTrackingId}&pesapal_merchant_reference=${OrderMerchantReference}`;
            res.status(200).send(responseText);

        } catch (error) {
            console.error('Error processing IPN:', error.response ? error.response.data : error.message);
            res.status(500).send('Error processing IPN');
        }
    } else {
        res.status(200).send('Acknowledged');
    }
};

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
        user: { select: { id: true, name: true, email: true, phone: true } },
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

    // Filter items and calculate total for this farmer
    const filteredOrders = orders.map(order => {
      const farmerItems = order.items.filter(item => item.product.farmerId === farmerId);
      const farmerTotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...order,
        items: farmerItems,
        total: farmerTotal,
      };
    }).filter(order => order.items.length > 0); // Only include orders with this farmer's items

    res.json(filteredOrders);
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
    const { userId, items, shippingAddress } = req.body;
    console.log('Received shippingAddress:', shippingAddress);
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }
    if (!shippingAddress || shippingAddress.trim() === "") {
      return res.status(400).json({ message: 'Shipping address is required.Find it in your profile' });
    }
    // Get user and cart details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Get product details and calculate total
    let total = 0;
    const orderItems = await Promise.all(items.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error('Product not found');
      if (product.stock < item.quantity) {
        throw new Error(`Stock for ${product.name} is outdated. Please refresh and try again.`);
      }
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
        shippingAddress: shippingAddress,
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
      console.log('Payment callback: updating stock for order', order.id);
      // Update order status
      await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
      // For each order item: decrease stock, add to farmer balance
      for (const item of order.items) {
        console.log('Decrementing stock for product', item.productId, 'by', item.quantity);
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

exports.getMyConsumerOrders = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching consumer orders:', error);
    res.status(500).json({ message: 'Failed to fetch your orders.' });
  }
};
