import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingBasket as ShoppingBasketIcon,
  MonetizationOn,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import AdminLayout from "../../layouts/AdminLayout";

export default function Dashboard() {
  const theme = useTheme();

  // State for summary, activity, loading, error
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch summary and activity from backend
        const [summaryRes, activityRes] = await Promise.all([
          axios.get("/api/admin/dashboard/summary"),
          axios.get("/api/admin/dashboard/recent-activity")
        ]);
        setSummary(summaryRes.data);
        setActivity(activityRes.data);

        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    {
      title: "Manage Users",
      icon: (
        <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      ),
      description: "View and manage user accounts",
      link: "/admin/users",
    },
    {
      title: "Manage Products",
      icon: (
        <InventoryIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Add, edit, and remove products",
      link: "/admin/products",
    },
    {
      title: "Manage Categories",
      icon: (
        <CategoryIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Organize product categories",
      link: "/admin/categories",
    },
    {
      title: "Manage Orders",
      icon: (
        <ShoppingBasketIcon
          sx={{ fontSize: 40, color: theme.palette.primary.main }}
        />
      ),
      description: "Track and process orders",
      link: "/admin/orders",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Welcome to Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your e-commerce platform from one central location
        </Typography>
      </Box>


      {/* Stat Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Total Users</Typography>
                <Typography variant="h4">{summary.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent>
                <InventoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Total Products</Typography>
                <Typography variant="h4">{summary.totalProducts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent>
                <ShoppingBasketIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h4">{summary.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent>
                <MonetizationOn color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">Ksh {summary.revenue?.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Activity Feed */}
      {activity.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <List>
                {activity.slice(0, 5).map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{item.user?.name?.charAt(0) || '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.action}
                        secondary={item.user?.name}
                      />
                    </ListItem>
                    {idx < activity.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Navigation Cards (original) */}
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              component={Link}
              to={card.link}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.light,
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& .MuiSvgIcon-root": {
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  {card.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h2"
                  color="text.primary"
                  gutterBottom
                >
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </AdminLayout>
  );
}

