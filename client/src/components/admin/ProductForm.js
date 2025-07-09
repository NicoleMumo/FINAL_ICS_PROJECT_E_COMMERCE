import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const ProductForm = ({ open, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    farmerId: '', // Required for admin add
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, farmerRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/admin/users/farmers'), // Assuming an endpoint to get farmers
        ]);
        setCategories(catRes.data);
        setFarmers(farmerRes.data);
      } catch (err) {
        console.error('Failed to fetch categories or farmers', err);
      }
    };

    fetchDropdownData();

    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.categoryId || '',
        farmerId: product.farmerId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        farmerId: '',
      });
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (!formData.categoryId || !formData.farmerId) {
      setError('Please select both a category and a farmer.');
      setIsSubmitting(false);
      return;
    }

    const apiEndpoint = product
      ? `/api/admin/products/${product.id}`
      : '/api/admin/products';
    const method = product ? 'put' : 'post';

    // Convert IDs to numbers before sending
    const payload = {
      ...formData,
      categoryId: Number(formData.categoryId),
      farmerId: Number(formData.farmerId),
    };

    try {
      await axios[method](apiEndpoint, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            name="name"
            label="Product Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <TextField
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Farmer</InputLabel>
            <Select name="farmerId" value={formData.farmerId} onChange={handleChange}>
              {farmers.map((farmer) => (
                <MenuItem key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
