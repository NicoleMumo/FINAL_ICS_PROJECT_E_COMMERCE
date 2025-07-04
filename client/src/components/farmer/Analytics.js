// src/components/farmer/Analytics.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
// For charts, you might use libraries like Chart.js or Recharts
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import FarmerLayout from "../../layouts/FarmerLayout"; // Corrected path

const Analytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        // IMPORTANT: These endpoints are examples. You'll need to create
        // backend routes specifically for farmer analytics (e.g., /api/farmer/sales-summary, /api/farmer/top-products)
        // const salesResponse = await axios.get("http://localhost:5000/api/farmer/sales-summary", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setSalesData(salesResponse.data);

        // const productsResponse = await axios.get("http://localhost:5000/api/farmer/top-products", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setTopProducts(productsResponse.data);

        // --- Dummy Data for Frontend Demo ---
        setTimeout(() => {
          setSalesData([
            { month: "Jan", sales: 4000 },
            { month: "Feb", sales: 3000 },
            { month: "Mar", sales: 5000 },
            { month: "Apr", sales: 4500 },
            { month: "May", sales: 6000 },
            { month: "Jun", sales: 5500 },
          ]);
          setTopProducts([
            { name: "Organic Tomatoes", unitsSold: 1200, revenue: 5400 },
            { name: "Fresh Carrots", unitsSold: 950, revenue: 3040 },
            { name: "Farm Fresh Eggs (dozen)", unitsSold: 800, revenue: 4000 },
          ]);
          setLoading(false);
        }, 1000); // Simulate API call
        // --- End Dummy Data ---
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  return (
    <FarmerLayout
      title="Analytics"
      subtitle="Insights into your farm's performance"
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#FFFFFF",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#212121", mb: 2 }}
            >
              Sales Overview
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
            {!loading && !error && (
              <Box>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  Total Revenue: $
                  {salesData
                    .reduce((sum, item) => sum + item.sales, 0)
                    .toFixed(2)}
                </Typography>
                {/* Example of where a chart would go */}
                <Box
                  sx={{
                    height: 300,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#F5F5F5",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Monthly Sales Chart (e.g., using Recharts)
                  </Typography>
                  {/*
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                  */}
                </Box>
                <Typography variant="body1" color="text.secondary">
                  *Integrate a charting library (e.g., Recharts, Chart.js) here
                  for visualizations.*
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: "#FFFFFF",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#212121", mb: 2 }}
            >
              Top Selling Products
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
            {!loading && !error && (
              <Box>
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <Box
                      key={index}
                      sx={{ mb: 1, p: 1, borderBottom: "1px solid #eee" }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Units Sold: {product.unitsSold} | Revenue: $
                        {product.revenue.toFixed(2)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No top selling products data available.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* You can add more analytics sections here, e.g., Inventory Health, Customer Demographics etc. */}
      </Grid>
    </FarmerLayout>
  );
};

export default Analytics;
