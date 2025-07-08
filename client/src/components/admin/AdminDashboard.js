import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  InputBase,
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrderIcon,
  Inventory as ProductIcon,
  AttachMoney as RevenueIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    userGrowth: [],
    transactionVolume: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, activityRes] = await Promise.all([
        axios.get('/api/admin/dashboard/summary'),
        axios.get('/api/admin/dashboard/recent-activity')
      ]);

      setStats({
        totalUsers: summaryRes.data.totalUsers,
        totalProducts: summaryRes.data.totalProducts,
        totalOrders: summaryRes.data.totalOrders,
        revenue: summaryRes.data.revenue,
        userGrowth: summaryRes.data.userGrowth || [],
        transactionVolume: summaryRes.data.transactionVolume || [],
        recentActivity: activityRes.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

  // Chart configurations
  const userGrowthData = {
    labels: stats.userGrowth.map(item => item.date),
    datasets: [{
      label: 'User Growth',
      data: stats.userGrowth.map(item => item.count),
      fill: false,
      borderColor: '#4CAF50',
      tension: 0.1
    }]
  };

  const transactionData = {
    labels: stats.transactionVolume.map(item => item.date),
    datasets: [{
      label: 'Transaction Volume',
      data: stats.transactionVolume.map(item => item.amount),
      backgroundColor: '#2196F3',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
          Dashboard Overview
        </Typography>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search..."
            inputProps={{ 'aria-label': 'search' }}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#e3f2fd' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="div">
                {stats.totalUsers.toLocaleString()}
              </Typography>
              <Typography color="textSecondary" variant="subtitle2">
                Total Users
              </Typography>
              <Typography variant="caption" color="success.main">
                +12% from last month
              </Typography>
            </Box>
          </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#e8f5e9' }}>
            <ProductIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="div">
                {stats.totalProducts.toLocaleString()}
              </Typography>
              <Typography color="textSecondary" variant="subtitle2">
                Total Products
              </Typography>
              <Typography variant="caption" color="success.main">
                +5% from last month
              </Typography>
            </Box>
          </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#fff3e0' }}>
            <OrderIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="div">
                {stats.totalOrders.toLocaleString()}
              </Typography>
              <Typography color="textSecondary" variant="subtitle2">
                Total Orders
              </Typography>
              <Typography variant="caption" color="success.main">
                +18% from last month
              </Typography>
            </Box>
          </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#fce4ec' }}>
            <RevenueIcon sx={{ fontSize: 40, color: '#e91e63', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="div">
                ${stats.revenue.toLocaleString()}
              </Typography>
              <Typography color="textSecondary" variant="subtitle2">
                Revenue
              </Typography>
              <Typography variant="caption" color="success.main">
                +23% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              User Growth
            </Typography>
            <Box sx={{ height: 240 }}>
              <Line data={userGrowthData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Volume
            </Typography>
            <Box sx={{ height: 240 }}>
              <Bar data={transactionData} options={chartOptions} />
            </Box>
          </Paper>
              </Grid>
            </Grid>

      {/* Recent Activity Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, width: 30, height: 30 }}>
                        {activity.user.name.charAt(0)}
                      </Avatar>
                      {activity.user.name}
                    </Box>
                  </TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.status}
                      color={activity.status === 'Active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 