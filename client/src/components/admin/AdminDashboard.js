import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Snackbar, Alert, Grid, Card, CardContent, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import UserList from './UserList';
import ProductList from './ProductList';
import OrderList from './OrderList';
import CategoryList from './CategoryList';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  // Simulate getting the admin's name from localStorage or context
  const [adminName] = useState(localStorage.getItem('adminName') || 'Admin');
  const [showWelcome, setShowWelcome] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 10000);
      return () => clearTimeout(timer);
    }
    // Fetch summary stats
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/admin/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load summary stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      {/* Welcome Popup */}
      <Snackbar
        open={showWelcome}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setShowWelcome(false)}
        autoHideDuration={10000}
      >
        <Alert
          severity="info"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowWelcome(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ alignItems: 'center' }}
        >
          Welcome, <b>{adminName}</b>!
        </Alert>
      </Snackbar>
      {/* Summary Stats */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Summary" />
          <Tab label="Users" />
          <Tab label="Products" />
          <Tab label="Orders" />
          <Tab label="Categories" />
        </Tabs>
        {tab === 0 && (
          loading ? (
            <Typography>Loading summary...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : summary ? (
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4">{summary.totalUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Products</Typography>
                    <Typography variant="h4">{summary.totalProducts}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Orders</Typography>
                    <Typography variant="h4">{summary.totalOrders}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Total Sales</Typography>
                    <Typography variant="h4">Ksh {summary.totalSales}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : null
        )}
        {tab === 1 && <UserList />}
        {tab === 2 && <ProductList />}
        {tab === 3 && <OrderList />}
        {tab === 4 && <CategoryList />}
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 