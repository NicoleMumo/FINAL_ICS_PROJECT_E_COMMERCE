import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://localhost:5000/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '', price: '', stock: '', categoryId: '' });
  const [success, setSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      setDeleteError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin/products/${selectedProduct.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Product updated successfully!');
      setEditOpen(false);
      fetchProducts();
    } catch (err) {
      setDeleteError('Failed to update product.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setDeleteError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      setDeleteError('Failed to delete product.');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Product Management
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {deleteError && <Alert severity="error">{deleteError}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.category?.name || ''}</TableCell>
                  <TableCell>{product.farmer?.name || ''}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(product)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(product.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={editData.name}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Price"
            name="price"
            type="number"
            value={editData.price}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Stock"
            name="stock"
            type="number"
            value={editData.stock}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Category ID"
            name="categoryId"
            value={editData.categoryId}
            onChange={handleEditChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList; 