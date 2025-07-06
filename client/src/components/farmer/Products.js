// src/components/farmer/Products.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import FarmerLayout from "../../layouts/FarmerLayout";

const API_BASE_URL = "http://localhost:5000";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        // Fetch only products for the current farmer
        const res = await axios.get(
          `${API_BASE_URL}/api/products/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load your products.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(products.filter((product) => product.id !== productId));
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product. Please try again.");
      }
    }
  };

  const handleEditProduct = (productId) => {
    // Navigate to the new EditProductForm
    navigate(`/farmer/products/edit/${productId}`);
  };

  return (
    <FarmerLayout title="Products" subtitle="Manage your farm products">
      <Paper
        sx={{ p: 3, backgroundColor: "#FFFFFF", boxShadow: 3, borderRadius: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#212121", mb: 2 }}
        >
          Your Product Listings
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
        {!loading && products.length === 0 && !error && (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", py: 4, color: "#616161" }}
          >
            No products found. Add your first product!
          </Typography>
        )}
        {!loading && products.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
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
                      sx={{ color: product.stock < 10 ? "#E53935" : "inherit" }}
                    >
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product.id)}
                      >
                        <EditIcon sx={{ color: "#0288D1" }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <DeleteIcon sx={{ color: "#E53935" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </FarmerLayout>
  );
};

export default Products;
