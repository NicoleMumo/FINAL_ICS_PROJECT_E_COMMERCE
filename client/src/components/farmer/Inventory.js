// src/components/farmer/Inventory.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Avatar,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // State for inline editing
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingStock, setEditingStock] = useState("");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/products/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products for inventory:", err);
        setError("Failed to fetch inventory. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditingStock(product.stock);
    setUpdateError(""); // Clear previous errors
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingStock("");
  };

  const handleSaveStock = async (productId) => {
    if (editingStock === "" || isNaN(editingStock) || Number(editingStock) < 0) {
      setUpdateError("Please enter a valid, non-negative stock number.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/products/${productId}/stock`,
        { stock: Number(editingStock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(
        products.map((p) =>
          p.id === productId ? response.data.product : p
        )
      );
      handleCancelEdit();
    } catch (err) {
      console.error("Error updating stock:", err);
      setUpdateError(err.response?.data?.message || "Failed to update stock.");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category &&
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <FarmerLayout title="Inventory" subtitle="Manage your product stock levels">
      <Paper
        sx={{ p: 3, backgroundColor: "#FFFFFF", boxShadow: 3, borderRadius: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#212121" }}>
            Current Stock
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

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
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUpdateError("")}>
            {updateError}
          </Alert>
        )}

        {!loading && filteredProducts.length === 0 && !error && (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", py: 4, color: "#616161" }}
          >
            No products found in inventory or matching your search.
          </Typography>
        )}

        {!loading && filteredProducts.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Avatar
                          src={
                            product.imageUrl
                              ? `${API_BASE_URL}${product.imageUrl}`
                              : "https://via.placeholder.com/40?text=No+Image"
                          }
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.category ? product.category.name : "N/A"}
                      </TableCell>
                      <TableCell>Ksh {product.price.toFixed(2)}</TableCell>
                      <TableCell
                        sx={{
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                        onClick={() =>
                          editingProductId !== product.id && handleEditClick(product)
                        }
                      >
                        {editingProductId === product.id ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              type="number"
                              value={editingStock}
                              onChange={(e) => setEditingStock(e.target.value)}
                              size="small"
                              autoFocus
                              sx={{ width: "80px", mr: 1 }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveStock(product.id);
                                if (e.key === "Escape") handleCancelEdit();
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleSaveStock(product.id)}
                            >
                              <CheckIcon color="success" />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <CloseIcon color="error" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              color:
                                product.stock < 10 ? "#E53935" : "inherit",
                              fontWeight:
                                product.stock < 10 ? "bold" : "normal",
                            }}
                          >
                            {product.stock}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              product.stock === 0
                                ? "#E53935"
                                : product.stock < 10
                                ? "#FF9800"
                                : "#4CAF50",
                            fontWeight: "bold",
                          }}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock < 10
                            ? "Low Stock"
                            : "In Stock"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredProducts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>
    </FarmerLayout>
  );
};

export default Inventory;
