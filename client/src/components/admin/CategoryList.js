import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import AdminLayout from '../../layouts/AdminLayout';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const unitOptions = [
    { value: 'leaf', label: 'Leaf (vegetables)' },
    { value: 'kg', label: 'Kilogram (grains)' },
    { value: 'fruit', label: 'Fruit (fruits)' },
    { value: 'piece', label: 'Piece (poultry)' },
    { value: 'litre', label: 'Litre (dairy)' },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/categories');
      setCategories(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`/api/admin/categories/${categoryId}`);
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !newUnit) return;
    try {
      await axios.post('/api/admin/categories', { name: newCategory.trim(), unit: newUnit });
      setNewCategory('');
      setNewUnit('');
      await fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Category Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Organize and manage product categories
        </Typography>
      </Box>

      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <form onSubmit={handleAddCategory}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                variant="outlined"
              />
              <TextField
                select
                size="small"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Select unit"
                variant="outlined"
                sx={{ minWidth: 140 }}
                SelectProps={{ native: true }}
              >
                <option value="">Select unit</option>
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </TextField>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                disabled={!newCategory.trim() || !newUnit}
              >
                Add Category
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" m={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : categories.length === 0 ? (
        <Alert severity="info">No categories found</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{category.unit || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleDelete(category.id)}
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
  );
};

export default CategoryList; 