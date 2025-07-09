// src/layouts/FarmerLayout.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Storefront as ProductsIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  BarChart as AnalyticsIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";

const FarmerLayout = ({ children, title, subtitle, showAddProduct = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleAddProductClick = () => {
    navigate("/farmer/add-product");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/farmer/dashboard",
    },
    {
      text: "Products",
      icon: <ProductsIcon />,
      path: "/farmer/products",
    },
    {
      text: "Inventory",
      icon: <InventoryIcon />,
      path: "/farmer/inventory",
    },
    {
      text: "Orders",
      icon: <OrdersIcon />,
      path: "/farmer/orders",
    },
    {
      text: "Analytics",
      icon: <AnalyticsIcon />,
      path: "/farmer/analytics",
    },
  ];

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FBE7" }}
    >
      {/* Sidebar */}
      <Paper
        sx={{
          width: 240,
          flexShrink: 0,
          backgroundColor: "#FFFFFF",
          boxShadow: 3,
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Avatar sx={{ bgcolor: "#4CAF50", mr: 1 }}>F</Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#4CAF50" }}
            >
              FarmDirect
            </Typography>
            <Typography variant="body2" sx={{ color: "#212121" }}>
              Farmer Portal
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path ? "#4CAF50" : "#212121",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color:
                    location.pathname === item.path ? "#212121" : "#212121",
                  fontWeight:
                    location.pathname === item.path ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#FFFFFF",
            boxShadow: 1,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box>
              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: "bold", color: "#212121" }}
              >
                {title}
              </Typography>
              <Typography variant="body2" sx={{ color: "#212121" }}>
                {subtitle}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <IconButton color="inherit" sx={{ color: "#212121" }}>
                <NotificationsIcon />
              </IconButton>
              {showAddProduct && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: "#4CAF50",
                    "&:hover": { bgcolor: "#388E3C" },
                  }}
                  onClick={handleAddProductClick}
                >
                  Add Product
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{
                  backgroundColor: "#000000", // Black background
                  color: "#FFFFFF", // White text
                  "&:hover": {
                    backgroundColor: "#333333", // Darker grey on hover
                  },
                  ml: 1,
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page specific content */}
        {children}
      </Box>
    </Box>
  );
};

export default FarmerLayout;
