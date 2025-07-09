import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import ProductForm from "./ProductForm";
import AdminLayout from "../../layouts/AdminLayout";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      };
      const { data } = await axios.get("/api/admin/products", { params });
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to fetch products");
      setProducts([]);
    }
    setLoading(false);
  }, [sort]);

  useEffect(() => {
    fetchProducts();
  }, []); // Initial fetch for all products

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [sort, fetchProducts]);

  const handleOpenForm = (product = null) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/admin/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const formatPrice = (price) => {
    return typeof price === "number" ? `Ksh ${price.toLocaleString()}` : "N/A";
  };



  const handleSort = (property) => {
    const isAsc = sort.sortBy === property && sort.sortOrder === 'asc';
    setSort({ sortBy: property, sortOrder: isAsc ? 'desc' : 'asc' });
  };

  return (
    <>
      <AdminLayout>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Product Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            View and manage all products in the system
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{ mt: 2 }}
          >
            Add Product
          </Button>

        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" m={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : products.length === 0 ? (
          <Alert severity="info">No products found</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "background.default" }}>
                  <TableCell sortDirection={sort.sortBy === 'name' ? sort.sortOrder : false}>
                    <TableSortLabel
                      active={sort.sortBy === 'name'}
                      direction={sort.sortBy === 'name' ? sort.sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Product
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sort.sortBy === 'price' ? sort.sortOrder : false}>
                    <TableSortLabel
                      active={sort.sortBy === 'price'}
                      direction={sort.sortBy === 'price' ? sort.sortOrder : 'asc'}
                      onClick={() => handleSort('price')}
                    >
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sort.sortBy === 'stock' ? sort.sortOrder : false}>
                    <TableSortLabel
                      active={sort.sortBy === 'stock'}
                      direction={sort.sortBy === 'stock' ? sort.sortOrder : 'asc'}
                      onClick={() => handleSort('stock')}
                    >
                      Stock
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sort.sortBy === 'categoryId' ? sort.sortOrder : false}>
                    <TableSortLabel
                      active={sort.sortBy === 'categoryId'}
                      direction={sort.sortBy === 'categoryId' ? sort.sortOrder : 'asc'}
                      onClick={() => handleSort('categoryId')}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sort.sortBy === 'farmerId' ? sort.sortOrder : false}>
                    <TableSortLabel
                      active={sort.sortBy === 'farmerId'}
                      direction={sort.sortBy === 'farmerId' ? sort.sortOrder : 'asc'}
                      onClick={() => handleSort('farmerId')}
                    >
                      Farmer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          src={product.imageUrl}
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography variant="subtitle2">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {product.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color="primary.main" fontWeight="medium">
                        {formatPrice(product.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${product.stock || 0} units`}
                        color={product.stock > 0 ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category?.name || "Uncategorized"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.farmer?.name || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleOpenForm(product)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(product.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminLayout>
      <ProductForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        product={selectedProduct}
      />
    </>
  );
};

export default ProductList;
