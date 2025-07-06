// src/components/farmer/Orders.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  LocalShipping as LocalShippingIcon,
  DoneAll as DoneAllIcon,
  Cancel as CancelIcon, // Added Cancel icon
} from "@mui/icons-material";
import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const statusColors = {
    PENDING: "warning",
    PROCESSING: "info",
    SHIPPED: "primary",
    DELIVERED: "success",
    CANCELLED: "error", // Added color for CANCELLED
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleMenuClick = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrderId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/orders/${selectedOrderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId ? { ...order, status: newStatus } : order
        )
      );
      handleMenuClose();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  return (
    <FarmerLayout title="Orders" subtitle="View and manage customer orders">
      <Paper
        sx={{ p: 3, backgroundColor: "#FFFFFF", boxShadow: 3, borderRadius: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#212121", mb: 2 }}
        >
          Customer Orders
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && orders.length === 0 && !error && (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", py: 4, color: "#616161" }}
          >
            No orders found.
          </Typography>
        )}
        {!loading && orders.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {order.user ? order.user.name : "N/A"}
                    </TableCell>
                    <TableCell>Ksh {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.items &&
                        order.items.map((item) => (
                          <Typography
                            key={item.id}
                            variant="body2"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {item.quantity} x{" "}
                            {item.product
                              ? item.product.name
                              : "Unknown Product"}
                          </Typography>
                        ))}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleMenuClick(e, order.id)}
                        disabled={
                          order.status === "DELIVERED" ||
                          order.status === "CANCELLED"
                        }
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id="long-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl) && selectedOrderId === order.id}
                        onClose={handleMenuClose}
                        PaperProps={{
                          style: {
                            maxHeight: 48 * 4.5,
                            width: "20ch",
                          },
                        }}
                      >
                        <MenuItem
                          onClick={() => handleUpdateOrderStatus("PROCESSING")}
                          disabled={
                            order.status === "PROCESSING" ||
                            order.status === "CANCELLED" ||
                            order.status === "DELIVERED"
                          }
                        >
                          <CheckCircleOutlineIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                          />{" "}
                          Process
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleUpdateOrderStatus("SHIPPED")}
                          disabled={
                            order.status === "SHIPPED" ||
                            order.status === "PENDING" ||
                            order.status === "CANCELLED" ||
                            order.status === "DELIVERED"
                          }
                        >
                          <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                          Ship
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleUpdateOrderStatus("DELIVERED")}
                          disabled={
                            order.status === "DELIVERED" ||
                            order.status === "PENDING" ||
                            order.status === "PROCESSING" ||
                            order.status === "CANCELLED"
                          }
                        >
                          <DoneAllIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                          Deliver
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleUpdateOrderStatus("CANCELLED")}
                          disabled={
                            order.status === "DELIVERED" ||
                            order.status === "CANCELLED"
                          }
                        >
                          <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Cancel
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </FarmerLayout>
  );
};

export default Orders;
