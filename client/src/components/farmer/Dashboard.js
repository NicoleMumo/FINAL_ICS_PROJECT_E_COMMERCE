// src/components/farmer/Dashboard.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Chip,
  Collapse, // For open/close animation
} from "@mui/material";
import {
  Delete as DeleteIcon,
  SwapHoriz as DispatchIcon,
  MailOutline as MailIcon,
  Analytics as AnalyticsIcon,
  WarningAmber as WarningAmberIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon, // For context menu/settings
  Close as CloseIcon, // For closing/hiding a tile
  OpenInFull as OpenInFullIcon, // For expanding/showing a tile
  DragIndicator as DragIndicatorIcon, // For drag handle
} from "@mui/icons-material";

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000";

// --- Dashboard Tile Configuration ---
// Define default order and visibility for tiles
const DEFAULT_TILE_CONFIG = [
  { id: "summaryCards", title: "Summary Overview", isVisible: true, span: 12 },
  {
    id: "recentProducts",
    title: "Recent Product Listings",
    isVisible: true,
    span: 6,
  },
  {
    id: "recentOrders",
    title: "Recent Incoming Orders",
    isVisible: true,
    span: 6,
  },
  { id: "salesAnalytics", title: "Sales Analytics", isVisible: true, span: 8 },
  {
    id: "topSellingProducts",
    title: "Top Selling Products",
    isVisible: true,
    span: 4,
  },
];

// --- Reusable DashboardTile Component ---
const DashboardTile = React.memo(
  ({
    id,
    title,
    children,
    isVisible,
    onToggleVisibility,
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
  }) => {
    return (
      <Grid
        item
        xs={12}
        md={DEFAULT_TILE_CONFIG.find((config) => config.id === id)?.span || 6} // Use span from config
        ref={setNodeRef}
        style={{
          ...style,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 1000 : "auto",
        }}
        aria-roledescription="draggable"
      >
        <Paper
          sx={{
            p: 3,
            backgroundColor: "#FFFFFF",
            boxShadow: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%", // Ensure consistent height for grids
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              borderBottom: "1px solid #eee",
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                {...listeners} // Drag handle listeners
                {...attributes} // Drag handle attributes
                size="small"
                sx={{ cursor: "grab", mr: 1 }}
                aria-label="Drag handle"
                aria-describedby={`draggable-item-${id}-description`}
              >
                <DragIndicatorIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#212121" }}
                id={`draggable-item-${id}-description`}
              >
                {title}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => onToggleVisibility(id)}
              aria-label={isVisible ? "Hide tile" : "Show tile"}
            >
              {isVisible ? <CloseIcon /> : <OpenInFullIcon />}
            </IconButton>
          </Box>
          <Collapse in={isVisible}>
            <Box sx={{ flexGrow: 1 }}>
              {" "}
              {/* Allow content to grow */}
              {children}
            </Box>
          </Collapse>
        </Paper>
      </Grid>
    );
  }
);

const Dashboard = () => {
  const navigate = useNavigate();

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    summaryData: {
      totalProducts: 0,
      pendingOrders: 0,
      lowStockItems: 0,
    },
    recentProducts: [],
    recentOrders: [],
    topSellingProducts: [],
  });

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for tile order and visibility
  const [tiles, setTiles] = useState(() => {
    try {
      const savedTiles = localStorage.getItem("farmerDashboardTiles");
      return savedTiles ? JSON.parse(savedTiles) : DEFAULT_TILE_CONFIG;
    } catch (e) {
      console.error("Failed to load dashboard tiles from localStorage:", e);
      return DEFAULT_TILE_CONFIG;
    }
  });

  // Save tiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("farmerDashboardTiles", JSON.stringify(tiles));
  }, [tiles]);

  // Map backend order statuses to MUI Chip colors
  const statusColors = {
    PENDING: "warning",
    PROCESSING: "info",
    SHIPPED: "primary",
    DELIVERED: "success",
    CANCELLED: "error",
  };

  // --- Data Fetching Effect ---
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Dependency array should include fetchDashboardData since it's a useCallback

  // --- DND Kit Handlers ---
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTiles((prevTiles) => {
      const oldIndex = prevTiles.findIndex((tile) => tile.id === active.id);
      const newIndex = prevTiles.findIndex((tile) => tile.id === over.id);
      return arrayMove(prevTiles, oldIndex, newIndex);
    });
  }, []);

  const handleToggleVisibility = useCallback((id) => {
    setTiles((prevTiles) =>
      prevTiles.map((tile) =>
        tile.id === id ? { ...tile, isVisible: !tile.isVisible } : tile
      )
    );
  }, []);

  // --- Action Handlers ---
  const handleViewAllProducts = useCallback(
    () => navigate("/farmer/products"),
    [navigate]
  );
  const handleAddProduct = useCallback(
    () => navigate("/farmer/products/add"),
    [navigate]
  );
  const handleEditProduct = useCallback(
    (productId) => navigate(`/farmer/products/edit/${productId}`),
    [navigate]
  );
  const handleViewAllOrders = useCallback(
    () => navigate("/farmer/orders"),
    [navigate]
  );
  const handleContactBuyer = useCallback((userId) => {
    // In a real app, this would open a chat or email interface
    alert(`Contacting buyer with ID: ${userId}`);
  }, []);

  const handleDeleteProduct = useCallback(
    async (productId) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Product deleted successfully!");
          fetchDashboardData(); // Re-fetch data to ensure consistency
        } catch (err) {
          console.error("Failed to delete product:", err);
          alert("Failed to delete product. Please try again.");
        }
      }
    },
    [fetchDashboardData]
  );

  const handleUpdateOrderStatus = useCallback(
    async (orderId, currentStatus) => {
      const newStatus =
        currentStatus === "PENDING"
          ? "PROCESSING"
          : currentStatus === "PROCESSING"
          ? "SHIPPED"
          : currentStatus === "SHIPPED" // Added for COMPLETED
          ? "DELIVERED"
          : currentStatus; // Fallback for already delivered or other states

      if (
        window.confirm(
          `Are you sure you want to update order status to ${newStatus}?`
        )
      ) {
        try {
          const token = localStorage.getItem("token");
          await axios.patch(
            `${API_BASE_URL}/api/orders/${orderId}/status`,
            { status: newStatus },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert(
            `Order ${orderId.substring(
              0,
              8
            )}... status updated to ${newStatus}.`
          );
          fetchDashboardData(); // Re-fetch data to ensure consistency
        } catch (err) {
          console.error("Failed to update order status:", err);
          alert("Failed to update order status. Please try again.");
        }
      }
    },
    [fetchDashboardData]
  );

  // --- Render Functions for Each Tile Content ---
  const renderTileContent = useCallback(
    (tileId) => {
      const { summaryData, recentProducts, recentOrders, topSellingProducts } =
        dashboardData;

      switch (tileId) {
        case "summaryCards":
          return (
            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Total Products */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Products
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ 
                        fontWeight: "bold", 
                        color: "primary.main",
                        mb: 1 
                      }}
                    >
                      {summaryData.totalProducts}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate("/farmer/products")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      Manage Products
                    </Button>
                  </Paper>
                </Grid>

                {/* Pending Orders */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pending Orders
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ 
                        fontWeight: "bold", 
                        color: "warning.main",
                        mb: 1 
                      }}
                    >
                      {summaryData.pendingOrders}
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => navigate("/farmer/orders")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      View Orders
                    </Button>
                  </Paper>
                </Grid>

                {/* Low Stock Items */}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Low Stock Items
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ 
                        fontWeight: "bold", 
                        color: "error.main",
                        mb: 1 
                      }}
                    >
                      {summaryData.lowStockItems}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => navigate("/farmer/inventory")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      Check Inventory
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          );

        case "recentProducts":
          return (
            <List>
              {recentProducts.length > 0 ? (
                recentProducts.map((product, index) => (
                  <ListItem
                    key={product.id || index} // Prefer product.id for key
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={
                          `${API_BASE_URL}${product.imageUrl}` ||
                          "/path/to/default-image.png"
                        }
                        alt={product.name}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", color: "#212121" }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Stock: {product.stock}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product.id)}
                        aria-label="Edit product"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProduct(product.id)}
                        aria-label="Delete product"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent products listed.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </Button>
                </Box>
              )}
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button size="small" onClick={handleViewAllProducts}>
                  View All Products
                </Button>
              </Box>
            </List>
          );

        case "recentOrders":
          return (
            <List>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <ListItem
                    key={order.id || index} // Prefer order.id for key
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: 1,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        Order #{order.id?.substring(0, 8)}...
                      </Typography>
                      <Chip
                        label={order.status}
                        color={statusColors[order.status] || "default"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Buyer: {order.user?.username || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: Ksh {order.totalAmount?.toFixed(2) || "0.00"}
                    </Typography>
                    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DispatchIcon />}
                        onClick={() =>
                          handleUpdateOrderStatus(order.id, order.status)
                        }
                        disabled={order.status === "DELIVERED"}
                      >
                        Update Status
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MailIcon />}
                        onClick={() => handleContactBuyer(order.user?.id)}
                        disabled={!order.user?.id}
                      >
                        Contact Buyer
                      </Button>
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent incoming orders.
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={handleViewAllOrders}
                  >
                    View All Orders
                  </Button>
                </Box>
              )}
            </List>
          );

        case "salesAnalytics":
          return (
            <Box
              sx={{
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#F5F5F5",
                borderRadius: 1,
              }}
            >
              <Typography variant="body1" sx={{ color: "#212121" }}>
                Sales Chart Visualization (Placeholder)
              </Typography>
            </Box>
          );

        case "topSellingProducts":
          return (
            <List>
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <ListItem
                    key={product.id || index} // Prefer product.id for key
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: "#212121" }}>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#212121" }}
                    >
                      {product.sales} units sold
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    No top selling products data.
                  </Typography>
                </ListItem>
              )}
            </List>
          );

        default:
          return null;
      }
    },
    [
      dashboardData, // Sufficient for all data access within the render function
      handleEditProduct,
      handleDeleteProduct,
      handleUpdateOrderStatus,
      handleContactBuyer,
      navigate,
      statusColors,
      handleAddProduct,
      handleViewAllProducts,
      handleViewAllOrders,
    ]
  );

  // --- Main Render Logic ---
  if (loading) {
    return (
      <FarmerLayout title="Dashboard">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <CircularProgress />
        </Box>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout
      title="Dashboard"
      subtitle="Overview of your farm's performance"
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tiles.map((tile) => tile.id)}
          strategy={verticalListSortingStrategy} // Or horizontalListSortingStrategy if you want horizontal dragging
        >
          <Grid container spacing={3}>
            {tiles.map((tile) => (
              <SortableDashboardTile
                key={tile.id}
                tile={tile}
                renderTileContent={renderTileContent}
                handleToggleVisibility={handleToggleVisibility}
              />
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </FarmerLayout>
  );
};

/**
 * SortableDashboardTile: Wraps DashboardTile and calls useSortable at the top level.
 */
const SortableDashboardTile = ({
  tile,
  renderTileContent,
  handleToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tile.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // The `md` prop on Grid item in DashboardTile should handle column span.
    // This `gridColumn` style might be redundant or for specific DND kit layout overrides.
    // If needed, use tile.span directly:
    // gridColumn: `span ${tile.span || 6}`,
  };

  return (
    <DashboardTile
      key={tile.id}
      id={tile.id}
      title={tile.title}
      isVisible={tile.isVisible}
      onToggleVisibility={handleToggleVisibility}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
    >
      {renderTileContent(tile.id)}
    </DashboardTile>
  );
};

export default Dashboard;
