// src/components/farmer/Analytics.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { MonetizationOn, TrendingUp, Star } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000";

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, topProductsRes, salesTrendRes, orderStatusRes, categorySalesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/sales-summary`, { headers }),
          axios.get(`${API_BASE_URL}/api/top-products`, { headers }),
          axios.get(`${API_BASE_URL}/api/sales-trend`, { headers }),
          axios.get(`${API_BASE_URL}/api/order-status`, { headers }),
          axios.get(`${API_BASE_URL}/api/category-sales`, { headers }),
        ]);

        setSummary(summaryRes.data);
        setTopProducts(topProductsRes.data);
        setSalesTrend(salesTrendRes.data);
        setOrderStatus(orderStatusRes.data);
        setCategorySales(categorySalesRes.data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to fetch analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <FarmerLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </FarmerLayout>
    );
  }

  if (error) {
    return (
      <FarmerLayout>
        <Alert severity="error">{error}</Alert>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout
      title="Analytics Dashboard"
      subtitle="An overview of your sales performance"
    >
      <Grid container spacing={3}>
        {/* Sales Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
              <MonetizationOn />
            </Avatar>
            <Box>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4">
                Ksh {summary?.totalSales.toFixed(2) || "0.00"}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
              <TrendingUp />
            </Avatar>
            <Box>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{summary?.totalOrders || 0}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
              <Star />
            </Avatar>
            <Box>
              <Typography variant="h6">Unique Customers</Typography>
              <Typography variant="h4">
                {summary?.uniqueCustomers || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Top Selling Products Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={chartPaperStyles}>
            <Typography variant="h6" gutterBottom>
              Top 5 Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalSold" fill="#8884d8" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={chartPaperStyles}>
            <Typography variant="h6" gutterBottom>
              Sales Trend (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#82ca9d" name="Daily Sales (Ksh)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={chartPaperStyles}>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={orderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by Category Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={chartPaperStyles}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#ffc658" name="Total Sales (Ksh)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </FarmerLayout>
  );
};

// Styles for the chart containers
const chartPaperStyles = {
  p: 2,
  height: 400,
  borderRadius: 2,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  display: 'flex',
  flexDirection: 'column',
};

// Colors for the Pie Chart
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default Analytics;
