import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_BASE_URL = 'http://localhost:5000/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleView = (order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setViewOpen(true);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      setStatusLoading(true);
      setSuccess('');
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/orders/${selectedOrder.id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Order status updated!');
      setViewOpen(false);
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Order Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user?.name || ''}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>Ksh {order.total}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleView(order)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* View Order Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography><b>Order ID:</b> {selectedOrder.id}</Typography>
              <Typography><b>User:</b> {selectedOrder.user?.name} ({selectedOrder.user?.email}, {selectedOrder.user?.phone})</Typography>
              <Typography><b>Status:</b> {selectedOrder.status}</Typography>
              <Typography><b>Total:</b> Ksh {selectedOrder.total}</Typography>
              <Typography><b>Date:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
              <Typography sx={{ mt: 2 }}><b>Items:</b></Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>Ksh {item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1"><b>Update Status:</b></Typography>
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  sx={{ minWidth: 150, mr: 2 }}
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={statusLoading}
                >
                  Update
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList; 