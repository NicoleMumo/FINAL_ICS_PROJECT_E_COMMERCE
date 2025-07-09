import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TextField,
  FormControl,
  InputLabel,
  TableSortLabel,
  IconButton,
} from '@mui/material';
import AdminLayout from '../../layouts/AdminLayout';
import { Delete as DeleteIcon } from '@mui/icons-material';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const headCells = [
    { id: 'id', label: 'Order Details', sortable: true },
    { id: 'customer', label: 'Customer', sortable: false },
    { id: 'createdAt', label: 'Date', sortable: true },
    { id: 'total', label: 'Total', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'items', label: 'Items', sortable: false },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      const { data } = await axios.get('/api/admin/orders', { params });
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    }
    setLoading(false);
  };

    useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [filters, sortConfig]);

    const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

    const handleSort = (key) => {
    if (!headCells.find(h => h.id === key)?.sortable) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'PROCESSING': 'info',
      'SHIPPED': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'error',
      'COMPLETED': 'success'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (items = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <AdminLayout>
            <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Order Management
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          name="search"
          label="Search by Order ID, Name, Email"
          variant="outlined"
          value={filters.search}
          onChange={handleFilterChange}
          fullWidth
        />
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            label="Status"
          >
            <MenuItem value=""><em>All Statuses</em></MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="PROCESSING">Processing</MenuItem>
            <MenuItem value="SHIPPED">Shipped</MenuItem>
            <MenuItem value="DELIVERED">Delivered</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : orders.length === 0 ? (
        <Alert severity="info">No orders found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {headCells.map((headCell) => (
                  <TableCell key={headCell.id} align={headCell.id === 'actions' ? 'right' : 'left'}>
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={sortConfig.key === headCell.id}
                        direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                                                      <TableCell>
                    <Typography variant="subtitle2" gutterBottom>
                      #{order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {order.user?.name || 'Anonymous'}
                    </Typography>
                    {order.user?.email && (
                      <Typography variant="body2" color="text.secondary">
                        {order.user.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="primary.main">
                      Ksh {(order.total || calculateOrderTotal(order.items)).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        size="small"
                        sx={{ 
                          '& .MuiSelect-select': { 
                            py: 0.5,
                            display: 'flex',
                            alignItems: 'center'
                          }
                        }}
                        renderValue={(status) => (
                          <Chip
                            label={status}
                            size="small"
                            color={getStatusColor(status)}
                          />
                        )}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="PROCESSING">Processing</MenuItem>
                        <MenuItem value="SHIPPED">Shipped</MenuItem>
                        <MenuItem value="DELIVERED">Delivered</MenuItem>
                        <MenuItem value="COMPLETED">Completed</MenuItem>
                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      </Select>
                    </Box>
                  </TableCell>
                   <TableCell>
                    <List dense disablePadding>
                      {order.items?.map((item, index) => (
                        <ListItem key={item.id || index} disablePadding>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                {item.product?.name} ({item.quantity} × Ksh {item.price.toLocaleString()})
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleDelete(order.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </AdminLayout>
  );
};

export default OrderList; 