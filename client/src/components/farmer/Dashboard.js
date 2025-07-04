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
              >
                <DragIndicatorIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#212121" }}
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
    totalProducts: 0,
    pendingOrders: 0,
    monthlySales: 0,
    lowStockItems: 0,
  });

  // State for lists
  const [productListings, setProductListings] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

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
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        // Fetch dashboard summary
        const summaryResponse = await axios.get(
          `${API_BASE_URL}/api/farmer/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(summaryResponse.data);

        // Fetch recent product listings (assuming a general products API)
        const productsResponse = await axios.get(
          `${API_BASE_URL}/api/products?limit=5&sortBy=createdAt&order=desc`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProductListings(productsResponse.data);

        // Fetch recent incoming orders
        const ordersResponse = await axios.get(
          `${API_BASE_URL}/api/farmer/dashboard/recent-orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIncomingOrders(ordersResponse.data);

        // Fetch top selling products
        const topSellingResponse = await axios.get(
          `${API_BASE_URL}/api/farmer/dashboard/top-selling`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTopSellingProducts(topSellingResponse.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

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
  const handleViewAllProducts = () => navigate("/farmer/products");
  const handleAddProduct = () => navigate("/farmer/products/add");
  const handleEditProduct = (productId) =>
    navigate(`/farmer/products/edit/${productId}`);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductListings(productListings.filter((p) => p.id !== productId));
        setDashboardData((prev) => ({
          ...prev,
          totalProducts: prev.totalProducts - 1,
        }));
        alert("Product deleted successfully!");
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product.");
      }
    }
  };

  const handleViewAllOrders = () => navigate("/farmer/orders");

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    let newStatus;
    if (currentStatus === "PENDING") {
      newStatus = "PROCESSING";
    } else if (currentStatus === "PROCESSING") {
      newStatus = "SHIPPED";
    } else {
      alert(
        `Order is already ${currentStatus}. No further action can be taken from dashboard.`
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to mark order ${orderId.substring(
          0,
          8
        )}... as ${newStatus}?`
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
        setIncomingOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        const summaryResponse = await axios.get(
          `${API_BASE_URL}/api/farmer/dashboard/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(summaryResponse.data);
        alert(
          `Order ${orderId.substring(0, 8)}... status updated to ${newStatus}.`
        );
      } catch (err) {
        console.error("Error updating order status:", err);
        setError("Failed to update order status.");
      }
    }
  };

  const handleContactBuyer = (userId) => {
    console.log("Contact buyer for user ID:", userId);
    alert("Contact buyer feature is not yet implemented.");
  };

  // --- Render Functions for Each Tile Content ---
  const renderTileContent = useCallback(
    (tileId) => {
      switch (tileId) {
        case "summaryCards":
          return (
            <Grid container spacing={2}>
              {" "}
              {/* Inner grid for summary cards */}
              <Grid
                item
                xs={12}
                sm={6}
                md={
                  DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")?.span
                    ? (12 /
                        DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")
                          .span) *
                      3
                    : 3
                }
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#424242" }}>
                    Total Products
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#4CAF50" }}
                  >
                    {dashboardData.totalProducts}
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleViewAllProducts}
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={
                  DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")?.span
                    ? (12 /
                        DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")
                          .span) *
                      3
                    : 3
                }
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#424242" }}>
                    Pending Orders
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#E53935" }}
                  >
                    {dashboardData.pendingOrders}
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleViewAllOrders}
                    startIcon={<VisibilityIcon />}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={
                  DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")?.span
                    ? (12 /
                        DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")
                          .span) *
                      3
                    : 3
                }
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#424242" }}>
                    Monthly Sales
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#4CAF50" }}
                  >
                    Ksh {dashboardData.monthlySales.toFixed(2)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate("/farmer/analytics")}
                    startIcon={<AnalyticsIcon />}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                md={
                  DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")?.span
                    ? (12 /
                        DEFAULT_TILE_CONFIG.find((c) => c.id === "summaryCards")
                          .span) *
                      3
                    : 3
                }
              >
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: "#F0F0F0",
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: "#424242" }}>
                    Low Stock Items
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#E53935" }}
                  >
                    {dashboardData.lowStockItems}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate("/farmer/inventory")}
                    startIcon={<WarningAmberIcon />}
                  >
                    View
                  </Button>
                </Box>
              </Grid>
            </Grid>
          );

        case "recentProducts":
          return (
            <Box>
              {productListings.length > 0 ? (
                productListings.map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      p: 2,
                      border: "1px solid #E0E0E0",
                      borderRadius: 1,
                      "&:last-child": { mb: 0 },
                    }}
                  >
                    <Avatar
                      src={
                        product.imageUrl
                          ? `${API_BASE_URL}${product.imageUrl}`
                          : "https://via.placeholder.com/50?text=No+Img"
                      }
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "#212121" }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#212121" }}>
                        Ksh {product.price ? product.price.toFixed(2) : "N/A"} /{" "}
                        {product.unit || "unit"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: product.stock < 10 ? "#E53935" : "#212121",
                        }}
                      >
                        In Stock: {product.stock || 0} {product.unit || "units"}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleEditProduct(product.id)}
                      aria-label={`Edit ${product.name}`}
                    >
                      <EditIcon sx={{ color: "#0288D1" }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <DeleteIcon sx={{ color: "#E53935" }} />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    No recent products found.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </Button>
                </Box>
              )}
            </Box>
          );

        case "recentOrders":
          return (
            <Box>
              {incomingOrders.length > 0 ? (
                incomingOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      mb: 2,
                      p: 2,
                      border: "1px solid #E0E0E0",
                      borderRadius: 1,
                      "&:last-child": { mb: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={`https://via.placeholder.com/40?text=${
                            order.user?.name ? order.user.name.charAt(0) : "?"
                          }`}
                          alt={order.user?.name || "Customer"}
                          sx={{ width: 40, height: 40, mr: 1 }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold", color: "#212121" }}
                        >
                          {order.user?.name || "Customer"}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status}
                        color={statusColors[order.status] || "default"}
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#212121", mb: 0.5 }}
                    >
                      {order.orderItems.length > 0
                        ? `${order.orderItems[0].quantity} x ${
                            order.orderItems[0].product?.name ||
                            "Unknown Product"
                          }${
                            order.orderItems.length > 1
                              ? ` (+${order.orderItems.length - 1} more)`
                              : ""
                          }`
                        : "No items"}
                      - Ksh {order.total ? order.total.toFixed(2) : "0.00"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#212121", fontSize: "0.8rem" }}
                    >
                      Ordered on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {order.status === "PENDING" ? (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            bgcolor: "#4CAF50",
                            "&:hover": { bgcolor: "#388E3C" },
                            mr: 1,
                          }}
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "PENDING")
                          }
                        >
                          Mark Prepared
                        </Button>
                      ) : order.status === "PROCESSING" ? (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DispatchIcon />}
                          sx={{
                            bgcolor: "#0288D1",
                            "&:hover": { bgcolor: "#0277BD" },
                            mr: 1,
                          }}
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "PROCESSING")
                          }
                        >
                          Dispatch
                        </Button>
                      ) : (
                        <Chip
                          label={order.status}
                          color={statusColors[order.status]}
                          size="small"
                        />
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MailIcon />}
                        sx={{
                          color: "#0288D1",
                          borderColor: "#0288D1",
                          "&:hover": {
                            borderColor: "#0277BD",
                            color: "#0277BD",
                          },
                        }}
                        onClick={() => handleContactBuyer(order.user?.id)}
                        disabled={!order.user?.id}
                      >
                        Contact Buyer
                      </Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent incoming orders.
                  </Typography>
                </Box>
              )}
            </Box>
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
                    key={index}
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
      dashboardData,
      productListings,
      incomingOrders,
      topSellingProducts,
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
    gridColumn: `span ${
      DEFAULT_TILE_CONFIG.find((config) => config.id === tile.id)?.span || 6
    }`,
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
